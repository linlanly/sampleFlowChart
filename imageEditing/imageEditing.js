class editImage {
  constructor({ width = 600, height = 400 } = {}) {
    this.width = width;
    this.height = height;
    this.canvas = new fabric.Canvas("canvas", {
      width,
      height,
      selectionColor: "transparent",
      selectionBorderColor: "transparent",
      hoverCursor: "default",
    });

    this.type = "";
    this.color = "#000";
    this.lineWidth = 2;
    this.fontSize = 20;
    this.lastPoint = {};
    this.isDrawing = false;

    // 设置图形移动并限制在框内
    this.canvas.on("object:moving", (opt) => {
      if (this.polygon) {
        this.canvas.remove(this.polygon);
        this.polygon = null;
      }
      if (this.isDrawing) {
        this.isDrawing = false;
      }
      let top = opt.target.top;
      let left = opt.target.left;
      let width = opt.target.width / 2;
      let height = opt.target.height / 2;
      opt.target.left = Math.min(Math.max(left, width), this.width - width);
      opt.target.top = Math.min(Math.max(top, height), this.height - height);
    });

    this.canvas.on("mouse:down", (...rest) => this.onMouseDown(...rest));
    this.canvas.on("mouse:up", (...rest) => this.onMouseUp(...rest));
    this.canvas.on("mouse:move", (...rest) => this.onMouseMove(...rest));
  }
  drawBefore(type = this.type) {
    this.color = document.querySelector("#color").value;
    this.lineWidth = parseInt(document.querySelector("#lineWidth").value);
    this.fontSize = parseInt(document.querySelector("#fontSize").value);
    this.blurText();
    if (type === "drawingMode") {
      this.canvas.isDrawingMode = true;
    } else {
      this.canvas.isDrawingMode = false;
    }
    if (["rectangle", "ellipse", "triangle", "arrow"].includes(type)) {
      this.type = type;
    } else {
      this.type = null;
      if (this.polygon) {
        this.canvas.remove(this.polygon);
        this.polygon = null;
      }
      if (typeof this[type] === "function") {
        this[type]();
      }
    }
    this.shapeOption = {
      top: this.lastPoint.x,
      left: this.lastPoint.y,
      fill: "transparent",
      stroke: this.color,
      strokeWidth: this.lineWidth,
      selectable: false,
      strokeUniform: true,
    };
  }
  // 监听鼠标按下事件
  onMouseDown(opt) {
    if (!this.type) return;
    let obj = this.canvas.getActiveObject();
    if (obj) return;
    this.lastPoint = opt.scenePoint || null;
    this.isDrawing = true;
  }
  onMouseMove(opt) {
    if (!this.type) return;
    let pointer = opt.scenePoint;
    if (
      !this.lastPoint ||
      JSON.stringify(this.lastPoint) === JSON.stringify(pointer)
    ) {
      // 点击事件，不生成图形
      return;
    }
    if (!this.isDrawing) return;
    if (this.polygon) {
      this.canvas.remove(this.polygon);
    }
    switch (this.type) {
      case "ellipse":
        this.drawellipse(pointer);
        break;
      case "rectangle":
        this.drawRectangle(pointer);
        break;
      case "triangle":
        this.drawTriangle(pointer);
        break;
      case "arrow":
        this.drawArrow(pointer);
        break;
    }
    if (this.polygon) {
      this.canvas.add(this.polygon);
    }
  }
  // 监听鼠标松开事件
  onMouseUp(opt) {
    this.isDrawing = false;
    // 图形选中处理
    if (
      !this.polygon ||
      (this.lastPoint &&
        JSON.stringify(this.lastPoint) === JSON.stringify(opt.scenePoint))
    ) {
      const pointer = opt.scenePoint;
      const objects = this.canvas.getObjects();
      let activeObject;
      let length = objects.length;
      for (let i = 0; i < length; i++) {
        let { left, top, width, height } = objects[i];
        left -= width / 2;
        top -= height / 2;
        let { x, y } = opt.scenePoint;
        // 图片一般作为背景，不考虑选中
        if (width < 1 || height < 1 || objects[i].type === "image") continue;
        // 防止正常画布绘制，绘制完成，完成的图形处于被选中
        let isAbnormalPath =
          i !== length - 1 ||
          objects[i].type !== "path" ||
          objects[i].path.length < 3;
        if (objects[i].containsPoint(opt.scenePoint) && isAbnormalPath) {
          activeObject = objects[i];
          break;
        }
        if (
          x >= left &&
          x <= left + width &&
          y >= top &&
          y <= top + height &&
          isAbnormalPath
        ) {
          activeObject = objects[i];
          break;
        }
      }
      this.canvas.remove(this.polygon);
      if (activeObject) {
        // 当前是画笔模式，删除因点击图形而新增的图形
        let endObj = objects[length - 1];
        if (endObj.type === "path" && endObj.path.length < 3) {
          this.canvas.remove(endObj);
        }
        // 设置图形为选中
        activeObject.selectable = true;
        this.canvas.setActiveObject(activeObject);
        this.canvas.requestRenderAll();
      }
    }
    this.polygon = null;
  }
  // 绘制矩形
  drawRectangle(pointer) {
    let { x, y } = this.lastPoint;
    let { x: x1, y: y1 } = pointer;
    let width = Math.abs(x - x1);
    let height = Math.abs(y - y1);
    let halfwidth = width / 2;
    let halfheight = height / 2;
    let top = Math.min(y, y1) + halfheight;
    let left = Math.min(x, x1) + halfwidth;
    this.polygon = new fabric.Rect({
      ...this.shapeOption,
      width,
      height,
      top,
      left,
    });
  }
  // 绘制三角形
  drawTriangle(pointer) {
    let { x, y } = this.lastPoint;
    let { x: x1, y: y1 } = pointer;
    let width = Math.abs(x - x1);
    let height = Math.abs(y - y1);
    let halfwidth = width / 2;
    let halfheight = height / 2;
    let top = Math.min(y, y1) + halfheight;
    let left = Math.min(x, x1) + halfwidth;
    this.polygon = new fabric.Triangle({
      ...this.shapeOption,
      width,
      height,
      top,
      left,
    });
  }
  // 绘制椭圆
  drawellipse(pointer) {
    let { x, y } = this.lastPoint;
    let { x: x1, y: y1 } = pointer;
    let width = Math.abs(x - x1) / 2;
    let height = Math.abs(y - y1) / 2;
    let top = Math.min(y, y1) + height;
    let left = Math.min(x, x1) + width;
    this.polygon = new fabric.Ellipse({
      ...this.shapeOption,
      rx: width,
      ry: height,
      top,
      left,
      angle: 0,
    });
  }
  // 画笔
  drawingMode() {
    if (!this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    }
    this.canvas.freeDrawingBrush.color = this.color;
    this.canvas.freeDrawingBrush.width = this.lineWidth;
  }
  // 箭头
  drawArrow(pointer) {
    let { x, y } = this.lastPoint;
    let { x: x1, y: y1 } = pointer;

    let width = (this.lineWidth * 3) / 2;
    let height = (width * 4) / 3;
    let C = this.getPointOfTemp([x1, y1], [x, y], height, "-");

    let D = this.getPoint(C, [x1, y1], width, "-");
    let F = this.getPoint(C, [x1, y1], this.lineWidth / 2, "-");
    let E = this.getPoint(C, [x1, y1], width);
    let G = this.getPoint(C, [x1, y1], this.lineWidth / 2);

    let path = `M ${x} ${y} L ${F.join(" ")} L ${D.join(" ")} L ${pointer.x} ${
      pointer.y
    } L ${E.join(" ")} L ${G.join(" ")} Z`;
    this.polygon = new fabric.Path(path, {
      stroke: this.color,
      strokeWidth: 1,
      fill: this.color,
      selectable: false,
    });
  }
  // 计算AB线段内，距A为length线段内对应的点C
  getPointOfTemp(A, B, length) {
    let AB = [B[0] - A[0], B[1] - A[1]];
    let length_AB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2);
    let radio = length / length_AB;
    let leg_vector = [AB[0] * radio, AB[1] * radio];
    let C = [A[0] + leg_vector[0], A[1] + leg_vector[1]];
    return C;
  }
  // 计算直角三角形中，一直角边的顶点为A、B，计算距A为length时，直角三角形的另一顶点坐标
  // director为方向，为-认定在右边，否认定在左边
  getPoint(A, B, length, director) {
    let AB = [B[0] - A[0], B[1] - A[1]];
    let length_AB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2);
    let unit_AB = [AB[0] / length_AB, AB[1] / length_AB];
    let leg_vector = [-length * unit_AB[1], length * unit_AB[0]];
    if (director === "-") {
      leg_vector = [length * unit_AB[1], -length * unit_AB[0]];
    }
    let C = [A[0] + leg_vector[0], A[1] + leg_vector[1]];
    return C;
  }
  // 输入框
  inputText() {
    let { left, top } = this.clearEmptyText();
    let text = new fabric.IText("", {
      left,
      top,
      fontSize: this.fontSize,
      fontWeight: this.lineWidth * 100,
      fill: this.color,
      fontFamily: "Verdana",
      fontSmoothing: "antialiased",
    });
    this.canvas.add(text);
    text.enterEditing();
  }
  // 清除内容为空的输入框，并返回下一个输入框的位置
  clearEmptyText() {
    if (!this.canvas) return;
    const objects = this.canvas.getObjects();
    let left = 20,
      top = 20;
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].type === "i-text") {
        if (objects[i].text === "") {
          this.canvas.remove(objects[i]);
        } else {
          let { top: y } = objects[i];
          left += 30;
          top = y + this.fontSize + 10;
        }
      }
    }
    return { left, top };
  }
  // 将所有输入框失焦
  blurText() {
    if (!this.canvas) return;
    const objects = this.canvas.getObjects();
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].type === "i-text") {
        objects[i].exitEditing();
      }
    }
  }
  // 修改绘制图形
  changeType(type) {
    if (!this.canvas) return;
    this.type = type;
    this.canvas.isDrawingMode = false;
    this.blurText();
  }
  // 下载绘制内容
  saveImage() {
    if (!this.canvas) return;
    let a = document.createElement("a");
    a.style.display = "none";
    a.download = "图片";
    a.href = this.canvas.toDataURL();
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    });
  }
  // 向画布添加图片
  setBackgroundImage(imagePath) {
    if (!this.canvas) return;
    var imgObj = new Image();
    imgObj.src = imagePath;
    imgObj.onload = () => {
      var image = new fabric.Image(imgObj);
      let scaleX = this.width / imgObj.width;
      let scaleY = this.height / imgObj.height;
      let scale = scaleX;
      if (scaleY < scaleX) {
        scale = scaleY;
      }
      image.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
      });
      this.canvas.add(image);
      this.canvas.centerObject(image);
      this.canvas.requestRenderAll();
    };
  }
  // 清空内容
  clearContent() {
    if (!this.canvas) return;
    this.canvas.clear();
  }
}
