import { Delaunay } from "d3-delaunay";

document.addEventListener("DOMContentLoaded", () => {
  const canvasEl = document.getElementsByTagName("canvas")[0];
  const ctx = canvasEl.getContext("2d");

  canvasEl.width = self.innerWidth;
  canvasEl.height = self.innerHeight;

  let points = [];

  // // Set up border cells
  // let borderDensity = 10

  // points.push([-100, -100], [canvasEl.width + 100, canvasEl.height + 100])
  // for (let w = 0; w < canvasEl.width; w += canvasEl.width / borderDensity) {
  //   points.push([w, -100]);
  //   points.push([w, canvasEl.height + 100]);
  // }

  // for (let h = 0; h < canvasEl.height; h += canvasEl.height / borderDensity) {
  //   points.push([-100, h]);
  //   points.push([canvasEl.width + 100, h]);
  // }

  let cellCount = points.length + (canvasEl.width * canvasEl.height / 5000);

  for (let i = points.length; i < cellCount; i++) {
    points.push([
      Math.floor(canvasEl.width * Math.random()),
      Math.floor(canvasEl.height * Math.random())
    ]);
  }

  const delaunay = Delaunay.from(points)
  const voronoi = delaunay.voronoi([0, 0, canvasEl.width, canvasEl.height]);

  function clearCanvas() {
    voronoi.render(ctx);
    ctx.fillStyle = "rgba(0, 128, 255, 1.0)"
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.strokeStyle = "rgba(0, 255, 255, 1.0)"
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function drawDelaunay() {
    delaunay.render(ctx);
    ctx.strokeStyle = "rgba(0, 0, 0, 1.0)"
    ctx.lineWidth = 1;
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

  function fillCells(cells, backgroundColor, borderColor) {
    for (let cell of cells) {
      fillCell(cell, backgroundColor, borderColor)
    }
  }

  let prevHoverCell = 0;
  let currentHoverCell = 0;
  let currentNeighbors = [];
  let prevNeighbors = [];
  let otherCells = [];

  canvasEl.addEventListener('mousemove', function (e) {
    let mousePos = getMousePos(canvasEl, e);
    if (!voronoi.contains(currentHoverCell, mousePos.x, mousePos.y)) {
      for (let i = 0; i < cellCount; i++) {
        if (voronoi.contains(i, mousePos.x, mousePos.y)) {
          prevHoverCell = currentHoverCell;
          currentHoverCell = i;
        } else {
          otherCells.push(i)
        };
      }
    }
    if (currentHoverCell != prevHoverCell) {
      prevNeighbors = currentNeighbors;
      currentNeighbors = [...delaunay.neighbors(currentHoverCell)];
      // console.log("previous: ", prevHoverCell, prevNeighbors);
      // console.log("current: ", currentHoverCell, currentNeighbors);
      fillCells(prevNeighbors, "rgba(0, 128, 255, 1.0)", "rgba(0, 255, 255, 1.0)");
      fillCell(prevHoverCell, "rgba(0, 128, 255, 1.0)", "rgba(0, 255, 255, 1.0)");
      fillCells(currentNeighbors, "rgba(128, 128, 255, 1.0)", "rgba(0, 255, 255, 1.0)");
      fillCell(currentHoverCell, "rgba(0, 0, 255, 1.0)", "rgba(255, 255, 255, 1.0)");
    }
  }, false);

  clearCanvas();
});