import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Handle,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

interface NodeData {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>, id: string) => void;
  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>, id: string) => void;
}

const DrugReviewNode = ({ data, id }: { data: NodeData; id: string }) => (
  <div className="custom-node">
    <Handle type="target" position="top" />
    <p>What is the drug you are reviewing?</p>
    <input type="text" value={data.value} onChange={(e) => data.onChange(e, id)} onKeyPress={(e) => data.onKeyPress(e, id)} />
    <Handle type="source" position="bottom" />
  </div>
);

const FollowUpNode = ({ data, id }: { data: NodeData; id: string }) => (
  <div className="custom-node">
    <Handle type="target" position="top" />
    <p>Follow-up Questions:</p>
    <input type="text" value={data.value} onChange={(e) => data.onChange(e, id)} onKeyPress={(e) => data.onKeyPress(e, id)} />
    <Handle type="source" position="bottom" />
  </div>
);

const QuestionNode = ({ data, id, onChange }: { data: NodeData; id: string }) => (
  <div className="custom-node">
    <Handle type="target" position="top" />
    <p>Question:</p>
    <input type="text" value={data.value} onChange={(e) => data.onChange(e, id)} onKeyPress={(e) => data.onKeyPress(e, id)} />
    <Handle type="source" position="bottom" />
  </div>
);

const AnswerNode = ({ data, id, onChange }: { data: NodeData; id: string }) => (
  <div className="custom-node">
    <Handle type="target" position="top" />
    <p>Answer:</p>
    <input type="text" value={data.value} onChange={(e) => data.onChange(e, id)} onKeyPress={(e) => data.onKeyPress(e, id)} />
    <Handle type="source" position="bottom" />
  </div>
);

const PromptNode = ({ data, id, onChange }: { data: NodeData; id: string }) => (
  <div className="custom-node">
    <Handle type="target" position="top" />
    <p>Prompt:</p>
    <input type="text" value={data.value} onChange={(e) => data.onChange(e, id)} onKeyPress={(e) => data.onKeyPress(e, id)} />
    <Handle type="source" position="bottom" />
  </div>
);

const nodeTypes = {
  drugReviewNode: DrugReviewNode,
  followUpNode: FollowUpNode,
  questionNode: QuestionNode,
  answerNode: AnswerNode,
  promptNode: PromptNode,
};

const OptionsToolbox = ({ onAddQuestion, onAddAnswers, onAddPrompt }) => (
  <div className="options-toolbox">
    <button onClick={onAddQuestion}>Question</button>
    <button onClick={onAddAnswers}>Answers</button>
    <button onClick={onAddPrompt}>Prompts</button>
  </div>
);

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [drugName, setDrugName] = useState('');
  const [lastNodeType, setLastNodeType] = useState('');
  const [answerCount, setAnswerCount] = useState<Record<string, number>>({});


  const updateNodeData = useCallback((nodeId, newValue) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, value: newValue }};
      }
      return node;
    }));
  }, [setNodes]);

  const onDrugNameChange = useCallback((e: ChangeEvent<HTMLInputElement>, id: string) => {
    setDrugName(e.target.value);
    updateNodeData(id, e.target.value);
  }, [updateNodeData]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const followUpId = `followUp-${id}`;
      const newNode = {
        id: followUpId,
        type: 'followUpNode',
        data: { value: '', onChange: (evt) => updateNodeData(followUpId, evt.target.value) },
        position: { x: 300, y: 100 },
      };
      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) => addEdge({ id: `e${id}-${followUpId}`, source: id, target: followUpId }, eds));
      setLastNodeType('followUpNode');
    }
  }, [setNodes, setEdges, setLastNodeType, updateNodeData]);

  const addAnswerNode = useCallback((sourceId) => {
    const count = answerCount[sourceId] || 1;
    const newNodeId = `answer-${sourceId}-${count}`;
    const newNode = {
      id: newNodeId,
      type: 'answerNode',
      data: { value: '', onChange: (evt) => updateNodeData(newNodeId, evt.target.value) },
      position: { x: 300, y: 200 + nodes.length * 100 },
    };
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => addEdge({ id: `e${sourceId}-${newNodeId}`, source: sourceId, target: newNodeId }, eds));
    setAnswerCount(prev => ({ ...prev, [sourceId]: count + 1 }));
  }, [nodes, setNodes, setEdges, updateNodeData, answerCount]);

  const addNode = useCallback((type, sourceId) => {
    const newNodeId = `node-${nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      type,
      data: { value: '', onChange: (evt) => updateNodeData(newNodeId, evt.target.value) },
      position: { x: 300, y: 200 + nodes.length * 100 },
    };
    setNodes((nds) => nds.concat(newNode));

    if (nodes.find(node => node.id === sourceId)) {
      const newEdge = { id: `e${sourceId}-${newNodeId}`, source: sourceId, target: newNodeId };
      setEdges((eds) => addEdge(newEdge, eds));
    }
    setLastNodeType(type);
  }, [nodes, setNodes, setEdges, updateNodeData]);

  const onAddQuestion = useCallback((sourceId) => {
    addNode('questionNode', sourceId);
  }, [addNode]);

  const onAddAnswers = useCallback((sourceId) => {
    const firstAnswerId = `answer-${sourceId}-${answerCount[sourceId] || 1}`;
    const secondAnswerId = `answer-${sourceId}-${(answerCount[sourceId] || 1) + 1}`;
    const firstAnswerNode = {
      id: firstAnswerId,
      type: 'answerNode',
      data: { value: '', onChange: (evt) => updateNodeData(firstAnswerId, evt.target.value) },
      position: { x: 300, y: 200 + nodes.length * 100 },
    };
    const secondAnswerNode = {
      id: secondAnswerId,
      type: 'answerNode',
      data: { value: '', onChange: (evt) => updateNodeData(secondAnswerId, evt.target.value) },
      position: { x: 300, y: 300 + nodes.length * 100 },
    };

    setNodes((nds) => nds.concat([firstAnswerNode, secondAnswerNode]));
    setEdges((eds) => eds.concat([
      { id: `e${sourceId}-${firstAnswerId}`, source: sourceId, target: firstAnswerId },
      { id: `e${sourceId}-${secondAnswerId}`, source: sourceId, target: secondAnswerId }
    ]));
    setAnswerCount(prev => ({ ...prev, [sourceId]: (prev[sourceId] || 1) + 2 }));
  }, [nodes, setNodes, setEdges, updateNodeData, answerCount]);


  const onAddPrompt = useCallback((sourceId) => {
    addNode('promptNode', sourceId);
  }, [addNode]);

  const initFlow = useCallback(() => {
    const firstNodeId = 'node-1';
    setNodes([{
      id: firstNodeId,
      type: 'drugReviewNode',
      data: { value: drugName, onChange: onDrugNameChange, onKeyPress: handleKeyPress },
      position: { x: 250, y: 0 },
    }]);
  }, [drugName, onDrugNameChange, handleKeyPress, setNodes]);

  React.useEffect(() => {
    initFlow();
  }, [initFlow]);

  return (
    <div>
      <div className="react-flow-container">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          fitView
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        {nodes.length > 0 && lastNodeType === 'followUpNode' && (
          <OptionsToolbox 
            onAddQuestion={() => onAddQuestion(nodes[nodes.length - 1].id)} 
            onAddAnswers={() => onAddAnswers(nodes[nodes.length - 1].id)} 
            onAddPrompt={() => onAddPrompt(nodes[nodes.length - 1].id)} 
          />
        )}
      </div>
      {/* Add More Answers Button */}
      {nodes.some(node => node.type === 'followUpNode') && (
        <button onClick={() => addAnswerNode(nodes[nodes.length - 1].id)}>Add More Answers</button>
      )}
    </div>
  );
}

export default App;
