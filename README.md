# solovoi
diffusion gradients across voronoi cells

voronoi cells generated using the [d3-delaunay](https://github.com/d3/d3-delaunay/) library

hover over a cell to change its color. left click to add pigment; right click to remove it

cell neighbors calculated by first taking the delaunay neighbors of each circumcenter, then checking whether the corresponding cells share an edge

```js
class Cell {
  constructor(i, voronoi) {
    this.id = i;
    this.voronoi = voronoi;
    this.path = new Path2D(voronoi.renderCell(i));
    this.polygon = voronoi.cellPolygon(i);
    this.neighbors = [...voronoi.delaunay.neighbors(this.id)].filter(cell => this.borders(cell));
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
  };

  borders(cell) {
    let id;
    if (cell instanceof Cell) {id = cell.id} else {id = cell};
    return this.polygon.some(([x, y]) => this.voronoi.cellPolygon(id).some(([x_, y_]) => x == x_ && y == y_));
  }
}
```

cells increase or decrease in pigment based on the average pigmentation of neighboring cells

```js
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
  }, 0);
  ```
