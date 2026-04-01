import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    Position,
    MarkerType,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SurfaceResponse, DiscoveredRoute, DiscoveredForm, DiscoveredParameter, DiscoveredJSFile, APICall } from '@/types';
import { severityColor } from '@/lib/utils';

interface AttackSurfaceGraphProps {
    surface: {
        routes: DiscoveredRoute[];
        forms: DiscoveredForm[];
        parameters: DiscoveredParameter[];
        jsFiles: DiscoveredJSFile[];
        apiCalls: APICall[];
    };
    targetUrl: string;
}

const nodeClassName = "px-4 py-2 shadow-lg rounded-md border-2 bg-cyber-bg text-cyber-text-primary text-[10px] font-mono font-bold uppercase transition-all duration-300";

export const AttackSurfaceGraph: React.FC<AttackSurfaceGraphProps> = ({ surface, targetUrl }) => {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // 1. Root Node (Domain)
        const domain = new URL(targetUrl).hostname;
        const rootId = 'root';
        nodes.push({
            id: rootId,
            data: { label: domain },
            position: { x: 400, y: 50 },
            className: `${nodeClassName} border-cyber-cyan shadow-cyber-cyan/20`,
            style: { fontSize: '12px' }
        });

        // 2. JS Files Cluster
        if (surface.jsFiles.length > 0) {
            const jsClusterId = 'js-cluster';
            nodes.push({
                id: jsClusterId,
                data: { label: 'JS ASSETS' },
                position: { x: 50, y: 150 },
                className: `${nodeClassName} border-cyber-yellow shadow-cyber-yellow/10 opacity-70`
            });
            edges.push({
                id: `e-root-${jsClusterId}`,
                source: rootId,
                target: jsClusterId,
                animated: true,
                style: { stroke: '#FACC15', strokeWidth: 1 },
            });

            surface.jsFiles.slice(0, 5).forEach((js, idx) => {
                const id = `js-${js.id}`;
                nodes.push({
                    id,
                    data: { label: js.url.split('/').pop() || js.url },
                    position: { x: 0, y: 220 + idx * 40 },
                    className: `${nodeClassName} border-cyber-yellow/40 text-[8px]`,
                });
                edges.push({
                    id: `e-${jsClusterId}-${id}`,
                    source: jsClusterId,
                    target: id,
                    style: { stroke: '#FACC15', strokeWidth: 1, opacity: 0.5 },
                });
            });
        }

        // 3. API Calls cluster
        if (surface.apiCalls.length > 0) {
            const apiClusterId = 'api-cluster';
            nodes.push({
                id: apiClusterId,
                data: { label: 'EXTERNAL APIS' },
                position: { x: 750, y: 150 },
                className: `${nodeClassName} border-cyber-purple shadow-cyber-purple/10 opacity-70`
            });
            edges.push({
                id: `e-root-${apiClusterId}`,
                source: rootId,
                target: apiClusterId,
                animated: true,
                style: { stroke: '#A855F7', strokeWidth: 1 },
            });

            surface.apiCalls.slice(0, 5).forEach((api, idx) => {
                const id = `api-${api.id}`;
                nodes.push({
                    id,
                    data: { label: `${api.method} ${api.url.split('/').pop() || api.url}` },
                    position: { x: 800, y: 220 + idx * 40 },
                    className: `${nodeClassName} border-cyber-purple/40 text-[8px]`,
                });
                edges.push({
                    id: `e-${apiClusterId}-${id}`,
                    source: apiClusterId,
                    target: id,
                    style: { stroke: '#A855F7', strokeWidth: 1, opacity: 0.5 },
                });
            });
        }

        // 4. Routes
        surface.routes.slice(0, 15).forEach((route, idx) => {
            const routeId = `route-${route.id}`;
            const xOffset = 200 + (idx % 3) * 200;
            const yOffset = 200 + Math.floor(idx / 3) * 100;

            nodes.push({
                id: routeId,
                data: { label: route.url },
                position: { x: xOffset, y: yOffset },
                className: `${nodeClassName} ${route.risk_level === 'critical' || route.risk_level === 'high' ? 'border-cyber-red shadow-cyber-red/20' : 'border-cyber-green shadow-cyber-green/10'}`,
            });

            edges.push({
                id: `e-root-${routeId}`,
                source: rootId,
                target: routeId,
                style: { stroke: '#00F3FF', strokeWidth: 1 },
            });

            // 5. Forms on Route
            const routeForms = surface.forms.filter(f => f.route_id === route.id);
            routeForms.forEach((form, fIdx) => {
                const formId = `form-${form.id}`;
                nodes.push({
                    id: formId,
                    data: { label: `FORM: ${form.action || 'input'}` },
                    position: { x: xOffset - 30 + fIdx * 60, y: yOffset + 50 },
                    className: `${nodeClassName} border-cyber-cyan/30 text-[8px] opacity-80`,
                });
                edges.push({
                    id: `e-${routeId}-${formId}`,
                    source: routeId,
                    target: formId,
                    style: { stroke: '#00F3FF', strokeWidth: 0.5, strokeDasharray: '2,2' },
                });
            });
        });

        return { nodes, edges };
    }, [surface, targetUrl]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Only update if the structure actually changed to prevent flickering
    const initialNodesStr = JSON.stringify(initialNodes);
    const initialEdgesStr = JSON.stringify(initialEdges);

    useEffect(() => {
        setNodes(JSON.parse(initialNodesStr));
        setEdges(JSON.parse(initialEdgesStr));
    }, [initialNodesStr, initialEdgesStr, setNodes, setEdges]);

    return (
        <div className="w-full h-full bg-cyber-bg/50 rounded-lg overflow-hidden border border-cyber-border">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                className="bg-grid-white/[0.02]"
            >
                <Background color="#111" gap={20} />
                <Controls showInteractive={false} className="invert opacity-50" />
            </ReactFlow>
        </div>
    );
};
