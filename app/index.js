import { Delaunay } from "d3-delaunay";

document.addEventListener("DOMContentLoaded", () => {
  const canvasEl = document.getElementsByTagName("canvas")[0];
  canvasEl.width = 1000;
  canvasEl.height = 500;

  let cellCount = 100;
  const points = [];
  for (let i = 0; i < cellCount; i++) {
    points.push([
      Math.floor(canvasEl.width * Math.random()),
      Math.floor(canvasEl.height * Math.random())
    ]);
  }
  
  const voronoi = Delaunay.from(points).voronoi([
    0,
    0,
    canvasEl.width,
    canvasEl.height
  ]);

  const ctx = canvasEl.getContext("2d");

  function clearCanvas() {
    voronoi.render(ctx);
    ctx.fillStyle = "#6495ED"
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.strokeStyle = "#00FFFF"
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function getMousePos(canvasEl, e) {
    let rect = canvasEl.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function fillCell(i, backgroundColor, borderColor) {
    let cell = new Path2D(voronoi.renderCell(i))
    ctx.fillStyle = `${backgroundColor}`
    ctx.strokeStyle = `${borderColor}`
    ctx.fill(cell);
    ctx.stroke(cell);
  }

  canvasEl.addEventListener('mousemove', function (e) {
    // clearCanvas();
    let mousePos = getMousePos(canvasEl, e);
    // console.log(Date.now());
    for (let i = 0; i < cellCount; i++) {
      if (voronoi.contains(i, mousePos.x, mousePos.y)) {
        fillCell(i, '#00008B', '#00FFFF')
      } else {
        fillCell(i, '#6495ED', '#00FFFF')
      };
    }
    // console.log(Date.now());
  }, false);

  clearCanvas();
});