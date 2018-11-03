import { Delaunay } from "d3-delaunay";

document.addEventListener("DOMContentLoaded", () => {
  const canvasEl = document.getElementsByTagName("canvas")[0];
  canvasEl.width = self.innerWidth;
  canvasEl.height = self.innerHeight;

  let cellCount = canvasEl.width * canvasEl.height / 5000;
  const points = [];
  for (let i = 0; i < cellCount; i++) {
    points.push([
      Math.floor(canvasEl.width * Math.random()),
      Math.floor(canvasEl.height * Math.random())
    ]);
  }
  
  const delaunay = Delaunay.from(points)
  const voronoi = delaunay.voronoi([0, 0, canvasEl.width, canvasEl.height]);

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
    let mousePos = getMousePos(canvasEl, e);
    for (let i = 0; i < cellCount; i++) {
      if (voronoi.contains(i, mousePos.x, mousePos.y)) {
        fillCell(i, '#00008B', '#00FFFF')
        console.log(i, [...delaunay.neighbors(i)])
      } else {
        fillCell(i, '#6495ED', '#00FFFF')
      };
    }
  }, false);

  clearCanvas();
});