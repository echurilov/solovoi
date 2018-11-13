import { Delaunay } from "d3-delaunay";

class Cell {
  constructor(i, voronoi) {
    this.id = i
    this.polygon = voronoi.cellPolygon(i);
    this.path = new Path2D(voronoi.renderCell(i));
    this.voronoi = voronoi;
    this.fill = {
      "red": 0,
      "green": 128,
      "blue": 255,
      "alpha": 1.0
    }
    this.border = {
      "red": 0,
      "green": 255,
      "blue": 255,
      "alpha": 1.0
    }
    this.neighbors = [...voronoi.delaunay.neighbors(this.id)].filter(cell => this.borders(cell));
  };

  borders(cell) {
    let id;
    if (cell instanceof Cell) {id = cell.id} else {id = cell};
    return this.polygon.some(([x, y]) => this.voronoi.cellPolygon(id).some(([x_, y_]) => x == x_ && y == y_));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvasEl = document.getElementsByTagName("canvas")[0];
  const ctx = canvasEl.getContext("2d");

  canvasEl.width = self.innerWidth;
  canvasEl.height = self.innerHeight;

  let points = [];

  const cellCount = points.length + (canvasEl.width * canvasEl.height / 2500);

  for (let i = points.length; i < cellCount; i++) {
    points.push([
      Math.floor(canvasEl.width * Math.random()),
      Math.floor(canvasEl.height * Math.random())
    ]);
  }

  const delaunay = Delaunay.from(points)
  const voronoi = delaunay.voronoi([0, 0, canvasEl.width, canvasEl.height]);

  function drawVoronoi() {
    voronoi.render(ctx);
    ctx.fillStyle = "rgba(0, 128, 255, 1.0)"
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "rgba(0, 255, 255, 1.0)"
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawVoronoi();

  const allCells = [];
  
  for (let i = 0; i < cellCount; i++) {
    allCells.push(new Cell(i, voronoi));
  }

  function getMousePos(canvasEl, e) {
    let rect = canvasEl.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function fillCell(cell) {
    ctx.fillStyle = `rgba(${cell.fill.red}, ${cell.fill.green}, ${cell.fill.blue}, ${cell.fill.alpha})`
    ctx.strokeStyle = `rgba(${cell.border.red}, ${cell.border.green}, ${cell.border.blue}, ${cell.border.alpha})`
    ctx.fill(cell.path);
    ctx.stroke(cell.path);
  }

  function fillCells(cells) {
    for (let cell of cells) {
      fillCell(allCells[cell])
    }
  }

  function colorCell(cell, fillColor, borderColor) {
    cell.fill = {...cell.fill, ...fillColor}
    cell.border = borderColor;
  }

  function colorCells(cells, fillColor, borderColor) {
    for (let cell of cells) {
      colorCell(allCells[cell], fillColor, borderColor)
    }
  }

  function highlightCell(cell, fillColor, borderColor) {
    ctx.fillStyle = `rgba(${fillColor.red}, ${fillColor.green}, ${fillColor.blue}, ${fillColor.alpha})`
    ctx.strokeStyle = `rgba(${borderColor.red}, ${borderColor.green}, ${borderColor.blue}, ${borderColor.alpha})`
    ctx.fill(cell.path);
    ctx.stroke(cell.path);
  }

  function highlightCells(cells, fillColor, borderColor) {
    for (let cell of cells) {
      colorCell(allCells[cell], fillColor, borderColor)
    }
  }

  let prevHoverCell = allCells[0];
  let currentHoverCell = allCells[0];
  let painting = false;
  let mouseButton = 0;

  canvasEl.addEventListener('mousemove', (e) => {
    let mousePos = getMousePos(canvasEl, e);
    if (!voronoi.contains(currentHoverCell.id, mousePos.x, mousePos.y)) {
      for (let cell of allCells) {
        if (voronoi.contains(cell.id, mousePos.x, mousePos.y)) {
          prevHoverCell = currentHoverCell;
          currentHoverCell = cell;
        };
      }
    }
    
    if (currentHoverCell != prevHoverCell) {
      highlightCell(currentHoverCell, currentHoverCell.fill, { red: 255, green: 255, blue: 255, alpha: 1.0 });
    }
  }, false);

  canvasEl.addEventListener("mousedown", (mouse) => {
    mouse.preventDefault();
    mouseButton = mouse.button;
    painting = true;
  }, false);

  canvasEl.addEventListener('contextmenu', (mouse) => {
    mouse.preventDefault();
    mouseButton = mouse.button;
    painting = true;
  }, false);

  canvasEl.addEventListener("mouseup", () => {
    painting = false;
  }, false);

  canvasEl.addEventListener("mouseout", () => {
    painting = false;
  }, false);

  window.setInterval(() => {
    let rednesses = [];
    for (let cell of allCells) {
      rednesses.push(cell.neighbors.reduce((sum, neighbor) => {
      return sum + allCells[neighbor].fill.red
      },0) / cell.neighbors.length)
    }
    for (let i = 0; i < rednesses.length; i++) {
      if (allCells[i] != currentHoverCell){
        if (allCells[i].fill.red < rednesses[i]) {
          allCells[i].fill.red += 1;
        } else if (allCells[i].fill.red > rednesses[i]) {
          allCells[i].fill.red -= 1;
        }
        fillCell(allCells[i]);
      }
    }
    
    if (painting) {
      if (mouseButton == 0) { currentHoverCell.fill.red += 1 } else if (mouseButton == 2) { currentHoverCell.fill.red -= 1 };
      fillCell(currentHoverCell);
    }

    highlightCell(currentHoverCell, currentHoverCell.fill, { red: 255, green: 255, blue: 255, alpha: 1.0 });
  }, 10);

});