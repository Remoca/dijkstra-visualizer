const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const nodeRadius = 25;
let startNode = null;
let autoInterval = null;
let graphEditMode = false;
let selectedNode = null;
let draggingNodeIndex = null;
let isDragging = false;
let dragMoved = false;

const nodes = [
  { x: 400, y: 100 }, // 0
  { x: 300, y: 200 }, // 1
  { x: 500, y: 200 }, // 2
  { x: 200, y: 350 }, // 3
  { x: 400, y: 350 }, // 4
  { x: 400, y: 500 }, // 5
];

const edges = [
  { from: 0, to: 1, weight: 7 },
  { from: 0, to: 2, weight: 9 },
  { from: 1, to: 2, weight: 10 },
  { from: 1, to: 3, weight: 14 },
  { from: 2, to: 4, weight: 2 },
  { from: 3, to: 4, weight: 9 },
  { from: 4, to: 5, weight: 9 },
];

let distances = [];
let visited = [];
let prev = [];
let stepQueue = [];
let finished = false;
let locked = false;     // 起点锁定状态

// 初始化 Dijkstra 状态
function startDijkstra() {
  if (startNode === null) {
    alert("Please select a start node first.");
    return;
  }

  locked = true;

  const N = nodes.length;
  distances = Array(N).fill(Infinity);
  visited = Array(N).fill(false);
  prev = Array(N).fill(null);
  stepQueue = [];

  distances[startNode] = 0;
  stepQueue.push({ node: startNode, dist: 0 });
  finished = false;

  drawGraph();
  updateInfoPanel();
}

// 执行一步 Dijkstra
function stepDijkstra() {
    if (finished) return;

    if (stepQueue.length === 0) {
      finished = true;
      drawGraph();  // 显示最终路径
      alert("Dijkstra finished.");
      return;
    }

  // 模拟优先队列：按距离排序
  stepQueue.sort((a, b) => a.dist - b.dist);
  const { node: current } = stepQueue.shift();

  if (visited[current]) {
    return;
  }

  visited[current] = true;

  // 遍历相邻边
  edges.forEach(({ from, to, weight }) => {
    if (from === current || to === current) {
      const neighbor = (from === current) ? to : from;
      if (visited[neighbor]) return;

      const newDist = distances[current] + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        prev[neighbor] = current;
        stepQueue.push({ node: neighbor, dist: newDist });
      }
    }
  });

  drawGraph();
  updateInfoPanel();

  if (stepQueue.length === 0) finished = true;
}

// 画图函数
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 画边（含最短路径高亮）
  edges.forEach(({ from, to, weight }) => {
    const a = nodes[from];
    const b = nodes[to];
  
    // 判断是否为 prev[] 的路径边
    const isPrevPath = (prev[to] === from || prev[from] === to);
  
    // 判断两端是否访问
    const fromVisited = visited[from];
    const toVisited = visited[to];
  
    let strokeColor = "#999";
    let lineWidth = 2;
  
    if (isPrevPath) {
      if (fromVisited && toVisited) {
        strokeColor = "#e74c3c"; // 红色：路径已确定
        lineWidth = 4;
      } else if (fromVisited || toVisited) {
        strokeColor = "#f1c40f"; // 黄色：路径在进行中
        lineWidth = 3;
      }
    }
  
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  
    // 权重标签
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.fillText(weight, midX, midY);
  });

  // 画节点
  nodes.forEach((node, index) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);

    // 填充颜色
    if (startNode === index) {
      ctx.fillStyle = "#f39c12"; // 起点橙色
    } else if (visited[index]) {
      ctx.fillStyle = "#2ecc71"; // 访问后绿色
    } else {
      ctx.fillStyle = "#3498db"; // 默认蓝色
    }

    ctx.fill();

    // 边框颜色（高亮）
    if (graphEditMode && selectedNode === index) {
      ctx.strokeStyle = "#e67e22"; // 选中节点高亮橙色
      ctx.lineWidth = 4;
    } else {
      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 2;
    }

    ctx.stroke();

    // 编号
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(index, node.x, node.y);

    // 显示距离（非编辑模式时）
    if (!graphEditMode && distances[index] !== undefined && distances[index] !== Infinity) {
      ctx.fillStyle = "#000";
      ctx.font = "14px sans-serif";
      ctx.fillText(`(${distances[index]})`, node.x, node.y + 25);
    }
  });
}

// 自动播放函数
function startAutoPlay() {
  if (finished || stepQueue.length === 0) {
    alert("Nothing to auto-play. Please press start first.");
    return;
  }

  if (autoInterval !== null) return; // 防止重复点击

  autoInterval = setInterval(() => {
    if (finished || stepQueue.length === 0) {
      clearInterval(autoInterval);
      autoInterval = null;
      return;
    }
    stepDijkstra();
  }, 1000); // 每 1 秒执行一次
}

// 更新信息面板
function updateInfoPanel(optionalMessage) {
  const statusText = document.getElementById("statusText");
  const debugDiv = document.getElementById("debugInfo");

  if (optionalMessage) {
    statusText.innerText = optionalMessage;
    debugDiv.innerHTML = "";
    return;
  }

  // 初始状态
  if (startNode === null) {
    statusText.innerText = "Please select a start node.";
    debugDiv.innerHTML = "";
    return;
  }

  // 设置起点提示
  statusText.innerText = `Start node: ${startNode}`;

  if (!distances || distances.length === 0) {
    debugDiv.innerHTML = "";
    return;
  }

  // Step Queue 展示
  const queueList = stepQueue.map(obj => `(${obj.node}, ${obj.dist})`).join(", ");

  // 距离表格展示
  let tableHTML = `
    <p style="margin: 8px 0;"><strong>Step Queue:</strong> [ ${queueList} ]</p>
    <p style="margin: 8px 0;"><strong>Distance Table:</strong></p>
    <table style="
      border-collapse: collapse;
      width: 100%;
      font-size: 15px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
    ">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ccc; padding: 6px;">Node</th>
          <th style="border: 1px solid #ccc; padding: 6px;">Distance</th>
          <th style="border: 1px solid #ccc; padding: 6px;">Prev</th>
        </tr>
      </thead>
      <tbody>
  `;

  nodes.forEach((_, i) => {
    const d = distances[i] === Infinity ? "∞" : distances[i];
    const p = prev[i] === null ? "-" : prev[i];
    tableHTML += `
      <tr style="text-align: center;">
        <td style="border: 1px solid #ccc; padding: 6px;">${i}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${d}</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${p}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  debugDiv.innerHTML = tableHTML;
}

// demo 展示
function loadDemoGraph() {
  nodes.length = 0;
  edges.length = 0;

  nodes.push(
    { x: 400, y: 100 }, // 0
    { x: 300, y: 200 }, // 1
    { x: 500, y: 200 }, // 2
    { x: 200, y: 350 }, // 3
    { x: 400, y: 350 }, // 4
    { x: 400, y: 500 }  // 5
  );

  edges.push(
    { from: 0, to: 1, weight: 7 },
    { from: 0, to: 2, weight: 9 },
    { from: 1, to: 2, weight: 10 },
    { from: 1, to: 3, weight: 14 },
    { from: 2, to: 4, weight: 2 },
    { from: 3, to: 4, weight: 9 },
    { from: 4, to: 5, weight: 9 }
  );

  resetStateOnly();
  drawGraph();
  updateInfoPanel();
}

// reset功能
function resetStateOnly() {
  startNode = null;
  distances = [];
  visited = [];
  prev = [];
  stepQueue = [];
  finished = false;
  locked = false;

  if (autoInterval !== null) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
}

// 新建功能
function createNewGraph() {
  nodes.length = 0;
  edges.length = 0;
  graphEditMode = true;
  selectedNode = null;

  resetStateOnly();
  drawGraph();
  updateInfoPanel("Click canvas to add a node");

  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("importBtn").style.display = "inline-block";
}

// 连通性判断
function isGraphConnected() {
  if (nodes.length === 0) return false;

  const visitedNodes = new Set();
  const adjList = Array(nodes.length).fill(0).map(() => []);

  // 构建邻接表
  for (const edge of edges) {
    adjList[edge.from].push(edge.to);
    adjList[edge.to].push(edge.from); // 无向图
  }

  // DFS 遍历
  function dfs(v) {
    visitedNodes.add(v);
    for (const neighbor of adjList[v]) {
      if (!visitedNodes.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }

  dfs(0); // 从任意节点出发

  return visitedNodes.size === nodes.length;
}

// canvas逻辑
canvas.addEventListener("click", (e) => {
  if (dragMoved) {
    dragMoved = false; // 重置
    return; //阻止 click 行为（说明刚刚是拖动）
  }
  
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 判断是否点中某个节点
  let clickedIndex = null;
  nodes.forEach((node, index) => {
    const dx = node.x - clickX;
    const dy = node.y - clickY;
    if (Math.sqrt(dx * dx + dy * dy) <= nodeRadius) {
      clickedIndex = index;
    }
  });

  // === 构图模式 ===
  if (graphEditMode) {
    if (clickedIndex !== null) {
      // 重复点击同一节点：触发删除
      if (selectedNode === clickedIndex) {
        const confirmDelete = confirm(`Delete node ${clickedIndex} and its edges?`);
        if (confirmDelete) {
          // 删除节点
          nodes.splice(clickedIndex, 1);

          // 删除相关边
          for (let i = edges.length - 1; i >= 0; i--) {
            if (edges[i].from === clickedIndex || edges[i].to === clickedIndex) {
              edges.splice(i, 1);
            }
          }

          // 更新边的索引（节点编号缩小）
          for (let edge of edges) {
            if (edge.from > clickedIndex) edge.from--;
            if (edge.to > clickedIndex) edge.to--;
          }

          selectedNode = null;
          drawGraph();
          updateInfoPanel("Node deleted.");
        } else {
          selectedNode = null;
        }
        return;
      }

      // 点击第一个节点
      if (selectedNode === null) {
        selectedNode = clickedIndex;
        drawGraph();
        updateInfoPanel(`Selected node ${selectedNode} \n Click another node to add edge, or click same node again to delete it`);
      }
      // 点击第二个节点：添加边
      else if (selectedNode !== clickedIndex) {
        const from = selectedNode;
        const to = clickedIndex;
        const weightStr = prompt(`Enter weight for edge ${from} → ${to}:`, "1");
        const weight = parseInt(weightStr);

        if (!isNaN(weight) && weight > 0) {
          edges.push({ from, to, weight });
          selectedNode = null;
          drawGraph();
          updateInfoPanel("Edge added! Click canvas to add node or select nodes to create edge");
        } else {
          updateInfoPanel("Invalid weight. Please enter a positive integer.");
          selectedNode = null;
        }
      }
    }
    // 点击空白区域：添加新节点
    else {
      nodes.push({ x: clickX, y: clickY });
      drawGraph();
      updateInfoPanel("Node added! Click another spot or select nodes to connect with edge");
    }
  }

  // === 非构图模式 ===
  else if (!locked) {
    if (clickedIndex !== null) {
      startNode = clickedIndex;
      drawGraph();
      updateInfoPanel();
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  if (!graphEditMode) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  nodes.forEach((node, index) => {
    const dx = node.x - x;
    const dy = node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) <= nodeRadius) {
      draggingNodeIndex = index;
      isDragging = true;
    }
  });
});

canvas.addEventListener("mousemove", (e) => {
  if (!graphEditMode || !isDragging || draggingNodeIndex === null) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  nodes[draggingNodeIndex].x = x;
  nodes[draggingNodeIndex].y = y;

  dragMoved = true;
  drawGraph();
});

canvas.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    draggingNodeIndex = null;
  }
});



// 按钮绑定
document.getElementById("startBtn").addEventListener("click", startDijkstra);
document.getElementById("stepBtn").addEventListener("click", stepDijkstra);
document.getElementById("autoBtn").addEventListener("click", startAutoPlay);
document.getElementById("demoBtn").addEventListener("click", () => {
  loadDemoGraph();
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("importBtn").style.display = "none";  
});
document.getElementById("newBtn").addEventListener("click", createNewGraph);
document.getElementById("resetBtn").addEventListener("click", () => {
  resetStateOnly();
  drawGraph();
  updateInfoPanel();

  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("importBtn").style.display = "none";
});
document.getElementById("saveBtn").addEventListener("click", () => {
  const connected = isGraphConnected();

  if (!connected) {
    alert("The graph is not connected.\nDijkstra requires a connected graph.");
    return;
  }

  // 退出编辑模式
  graphEditMode = false;
  selectedNode = null;

  drawGraph();
  updateInfoPanel("Ready to run Dijkstra. \n Please select a start node.");
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("importBtn").style.display = "none";

  //询问是否下载 JSON 文件
  const saveJson = confirm("Do you want to download the graph as a JSON file?");
  if (saveJson) {
    const graphData = {
      nodes: nodes.map((node) => ({ x: node.x, y: node.y })),
      edges: edges.map((edge) => ({
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
      })),
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "graph.json";
    link.click();
    URL.revokeObjectURL(url);
  }
});
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});
document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      // 校验数据结构
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        alert("Invalid file format.");
        return;
      }

      // 清空当前图
      nodes.length = 0;
      edges.length = 0;

      // 加载数据
      for (const node of data.nodes) {
        if (typeof node.x === "number" && typeof node.y === "number") {
          nodes.push({ x: node.x, y: node.y });
        }
      }

      for (const edge of data.edges) {
        if (
          typeof edge.from === "number" &&
          typeof edge.to === "number" &&
          typeof edge.weight === "number" &&
          edge.weight > 0
        ) {
          edges.push({
            from: edge.from,
            to: edge.to,
            weight: edge.weight,
          });
        }
      }

      resetStateOnly();
      drawGraph();
      updateInfoPanel("Graph imported! You can continue editing.");

    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };

  reader.readAsText(file);
});

// 页面初始绘制
drawGraph();
