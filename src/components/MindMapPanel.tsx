import React, { useState, useRef, useEffect, useMemo } from "react";
import { GitFork, Network, RefreshCw, Sparkles } from "lucide-react";

interface MindMapPanelProps {
  onCallAI: (prompt: string, persona: string) => Promise<string | null>;
}

interface MindMapData {
  center: string;
  branches: {
    label: string;
    color?: string;
    children?: string[];
  }[];
}

export default function MindMapPanel({ onCallAI }: MindMapPanelProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MindMapData | null>({
    center: "Quadratic Equations",
    branches: [
      {
        label: "General Form",
        color: "#7c6bef",
        children: ["ax² + bx + c = 0", "a ≠ 0", "Degree is 2"]
      },
      {
        label: "Nature of Roots",
        color: "#00d4cc",
        children: ["D = b² - 4ac", "D > 0: Two Real", "D < 0: Complex"]
      },
      {
        label: "Solving Tools",
        color: "#ff6eb4",
        children: ["Factorization", "Formula Method", "Completing Square"]
      },
      {
        label: "Key Formula",
        color: "#ffd166",
        children: ["x = [-b ± √D]/2a", "Sum = -b/a", "Product = c/a"]
      }
    ]
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    if (canvasRef.current) {
      setDimensions({
        width: canvasRef.current.offsetWidth || 600,
        height: canvasRef.current.offsetHeight || 400
      });
    }
  }, [data]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const response = await onCallAI(
        `Generate a fully formatted valid JSON mind map mapping the core key concepts for the Indian board educational topic: ${topic.trim()}`,
        "mm"
      );

      if (response) {
        // Strip markdown backticks if any
        let clean = response.replace(/```json|```/g, "").trim();
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(clean);
        if (parsed.center && Array.isArray(parsed.branches)) {
          setData(parsed);
        }
      }
    } catch (err) {
      console.error("Error parsing mindmap JSON:", err);
    } finally {
      setLoading(false);
    }
  };

  // Node position calculation math with static-size canvas support for pristine scrollability
  const canvasWidth = 1000;
  const canvasHeight = 500;
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  // Isolate nodes and path calculations in useMemo to prevent recalculation layout thrashing 
  const { nodesList, pathsList } = useMemo(() => {
    const branches = data?.branches || [];
    const nodes: any[] = [];
    const paths: any[] = [];

    // 1. Center Node
    nodes.push({
      x: cx,
      y: cy,
      label: data?.center || "Topic",
      isCenter: true,
      color: "linear-gradient(135deg, #6366f1, #4f46e5)"
    });

    // Color options
    const defaultColors = ["#6366f1", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

    if (branches.length > 0) {
      // Symmetrically divide branches to Right and Left hemispheres to prevent visual clustering
      const half = Math.ceil(branches.length / 2);
      
      // Right hemisphere branches (cx + offset)
      const rightBranches = branches.slice(0, half);
      const rightYGap = canvasHeight / (rightBranches.length + 1);
      
      rightBranches.forEach((branch, bIdx) => {
        const bx = cx + 200;
        const by = (bIdx + 1) * rightYGap;
        const branchColor = branch.color || defaultColors[bIdx % defaultColors.length];

        // Connector from Center to Right Branch
        paths.push({
          x1: cx,
          y1: cy,
          x2: bx,
          y2: by,
          color: branchColor,
          thick: 3
        });

        nodes.push({
          x: bx,
          y: by,
          label: branch.label,
          color: branchColor,
          isBranch: true
        });

        // Right Branch Children: Stretched further right and stacked vertically
        const children = branch.children || [];
        if (children.length > 0) {
          const childYGap = 42;
          const startY = by - ((children.length - 1) * childYGap) / 2;

          children.forEach((child, cIdx) => {
            const chx = bx + 170;
            const chy = startY + (cIdx * childYGap);

            // Connector from Branch to Child
            paths.push({
              x1: bx,
              y1: by,
              x2: chx,
              y2: chy,
              color: branchColor,
              thick: 1.5,
              dashed: true
            });

            nodes.push({
              x: chx,
              y: chy,
              label: child,
              color: "rgba(10, 10, 25, 0.95)",
              isChild: true,
              borderColor: branchColor
            });
          });
        }
      });

      // Left hemisphere branches (cx - offset)
      const leftBranches = branches.slice(half);
      const leftYGap = canvasHeight / (leftBranches.length + 1);

      leftBranches.forEach((branch, bIdx) => {
        const bx = cx - 200;
        const by = (bIdx + 1) * leftYGap;
        // offset colors based on index
        const branchColor = branch.color || defaultColors[(bIdx + half) % defaultColors.length];

        // Connector from Center to Left Branch
        paths.push({
          x1: cx,
          y1: cy,
          x2: bx,
          y2: by,
          color: branchColor,
          thick: 3
        });

        nodes.push({
          x: bx,
          y: by,
          label: branch.label,
          color: branchColor,
          isBranch: true
        });

        // Left Branch Children: Stretched further left and stacked vertically
        const children = branch.children || [];
        if (children.length > 0) {
          const childYGap = 42;
          const startY = by - ((children.length - 1) * childYGap) / 2;

          children.forEach((child, cIdx) => {
            const chx = bx - 170;
            const chy = startY + (cIdx * childYGap);

            // Connector from Branch to Child
            paths.push({
              x1: bx,
              y1: by,
              x2: chx,
              y2: chy,
              color: branchColor,
              thick: 1.5,
              dashed: true
            });

            nodes.push({
              x: chx,
              y: chy,
              label: child,
              color: "rgba(10, 10, 25, 0.95)",
              isChild: true,
              borderColor: branchColor
            });
          });
        }
      });
    }

    return { nodesList: nodes, pathsList: paths };
  }, [data, cx, cy, canvasHeight]);

  return (
    <div className="rounded-2xl p-6 bg-[#12122c] border border-indigo-500/10 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white font-display flex items-center gap-2">
            <Network size={18} className="text-indigo-400" /> AI Visual Mind Mapper
          </h2>
          <p className="text-xs text-slate-400">Generate fully visual, interactive concept relational hierarchy charts dynamically</p>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Nervous System Class 10"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            className="bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-100 outline-none focus:border-indigo-400 w-52 sm:w-64"
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-indigo-500/10"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Map It
          </button>
        </form>
      </div>

      {/* Structured, scrollable canvas box */}
      <div className="w-full rounded-xl bg-slate-950/85 border border-slate-900/60 overflow-auto scrollbar-thin flex justify-start items-start p-2">
        <div
          ref={canvasRef}
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, position: "relative" }}
          className="flex-shrink-0 select-none overflow-hidden"
        >
          {/* Render Connection Pathways */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {pathsList.map((path, idx) => (
              <line
                key={idx}
                x1={path.x1}
                y1={path.y1}
                x2={path.x2}
                y2={path.y2}
                stroke={path.color}
                strokeWidth={path.thick}
                strokeLinecap="round"
                strokeDasharray={path.dashed ? "4 4" : undefined}
                className="opacity-80 transition-all duration-300"
              />
            ))}
          </svg>

          {/* Render Nodes relative to coordinates */}
          {nodesList.map((node, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: "translate(-50%, -50%)",
                background: node.isCenter ? node.color : node.isChild ? "rgba(15, 23, 42, 0.95)" : node.color + "cc" || "rgba(30,30,60,0.9)",
                border: node.isChild
                  ? `1px solid ${node.borderColor}`
                  : node.isCenter
                  ? "2px solid rgba(255,255,255,0.4)"
                  : "1px solid rgba(255,255,255,0.15)"
              }}
              className={`px-3 py-1.5 rounded-full text-white text-center font-bold tracking-tight shadow-md hover:scale-110 active:scale-95 transition-all text-xs max-w-[145px] hover:z-20 truncate ${
                node.isCenter
                  ? "font-extrabold text-sm shadow-indigo-500/20 py-2.5 px-6 min-w-[150px]"
                  : node.isBranch
                  ? "font-bold text-xs"
                  : "text-[10px] text-slate-300"
              }`}
              title={node.label}
            >
              {node.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
