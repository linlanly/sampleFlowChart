// 流程图
class FlowChart {
  // options.flowChart的期望格式
  // [
  //   {
  //     title: '业务使用单位', //列的标题
  //     list: [ //列含有的流程项
  //       { 
  //         title: '单位申请', // 流程项左边的文字
  //         notify: '关于物业配置的公函或请示附编制文件相关资料', // 流程项右边的文字，为空时该流程项为判断
  //         id: 1, // 流程项的id
  //         line: 1, // 流程项在整个流程图中的行位置
  //         to: [ // 当前流程项线条指向的其他流程项
  //           3,
  //           {
  //             id: 2, //指向流程项的id
  //             text: '操作', // 线条上展示的补充信息
  //             color: 'red' // 线条颜色
  //           }
  //         ]
  //       },
  //       { title: '腾退', notify: '腾退超标办公用房', id: 2, line: 8, to: [12] },
  //       { title: '归档', notify: '物业接收单位归档(上传移交清单等相关文件)', id: 12, line: 9 }
  //     ]
  //   },
  //   {
  //     title: '机关事务管理局',
  //     list: [
  //       { title: '面积重核', notify: '根据单位情况重核面积', id: 3, line: 1, to: [4] },
  //       { title: '是否超标', notify: '', id: 4, line: 2, to: [{ id: 5, text: '是', color: 'red' }, { id: 6, text: '否' }] },
  //       { title: '腾退方案', notify: '回收超标办公用房，形成超标腾退方案', id: 5, line: 3, to: [7] },
  //       { title: '调配方案', notify: '根据申请信息自动生成符合标准的办公用房调配方案', id: 6, line: 3, to: [8] },
  //       { title: '是否通过市机关事务局审核', notify: '', id: 7, line: 4, to: [{ id: 5, text: '不通过', color: 'red' }, { id: 8, text: '通过' }] },
  //       { title: '现场勘查', notify: '勘查现场图片', id: 8, line: 5, to: [9] },
  //       { title: '方案调整', notify: '方案选择和调整，形成初步方案', id: 9, line: 6, to: [10] },
  //       { title: '审批', notify: '相关处室审批，会议议定或领导签批，确定配置方案/腾退方案', id: 10, line: 7, to: [2, 11] },
  //       { title: '调配', notify: '分配办公用房', id: 11, line: 8 },
  //     ]
  //   }
  // ]
  constructor(options) {
    this.contentTop = options.contentTop || 62
    this.contentBottom = options.contentBottom || 125
    this.spaceHeight = options.spaceHeight || 70
    this.lineHeight = options.lineHeight || 22
    this.fontSize = options.fontSize || 14
    this.elemId = options.elemId
    this.flowChart = options.flowChart ? JSON.parse(JSON.stringify(options.flowChart)) : []
    this.textDistance = options.textDistance || 20
    this.radius = options.radius || 5
    this.lineWidth = options.lineWidth || 2
    this.arrowWidth = options.arrowWidth || 4
    this.arrowHeight = options.arrowHeight || 6
    this.lineColor = options.lineColor || '#8E9BD1'
    this.flowSpace = options.flowSpace || 10
    this.paddingLeft = options.paddingLeft || 12
    this.paddingRight = options.paddingRight || 12

    if (this.elemId) {
      let doc = document.getElementById(this.elemId)
      if (doc) {
        let contentWidth = doc.getBoundingClientRect().width
        this.initFlowChart(contentWidth)
        window.addEventListener('resize', () => {
          this.flowChart = options.flowChart ? JSON.parse(JSON.stringify(options.flowChart)) : []
          let contentWidth = doc.getBoundingClientRect().width
          this.initFlowChart(contentWidth)
        })
      }
    }
  }

  initFlowChart(contentWidth) {
    this.pathList = []
    this.textList = []
    let linesHeight = [0]

    //计算每个模块应有宽度
    let beforeModule = 0
    this.flowChart.forEach((flow) => {
      flow.list.forEach(item => {
        let lineOther = flow.list.filter(citem => item.line === citem.line);
        let index = lineOther.findIndex(citem => item.id === citem.id)
        item.module = index + beforeModule
        if (!flow.lines || flow.lines < lineOther.length) {
          flow.lines = lineOther.length
        }
      })
      beforeModule += flow.lines
    })
    let columns = this.flowChart.reduce((a, b) => a + b.lines, 0)
    let beforeModuleWidth = 0

    // 计算每个流程的宽度、高度、对应左上角位置
    this.flowChart.forEach((flow) => {
      let currentModuleWidth = flow.lines * contentWidth / columns
      flow.list.forEach(item => {
        item.x = beforeModuleWidth
        let lineOther = flow.list.filter(citem => item.line === citem.line);
        let index = lineOther.findIndex(citem => item.id === citem.id)
        if (lineOther.length > 1) {
          item.width = (currentModuleWidth - .05 * lineOther.length * currentModuleWidth) / lineOther.length
          item.x += .02 * currentModuleWidth + .05 * currentModuleWidth * index + index * item.width
        } else {
          item.width = currentModuleWidth * .66
          item.x += currentModuleWidth * .17
        }
        let leftWidth = this.getWidthInDocOfText(item.title, 'title')
        let leftHeihgt = 0
        if (item.notify && item.width - leftWidth < this.getWidthInDocOfText('四个文字', 'title')) {
          item.leftWidth = this.getWidthInDocOfText('文字', 'title')
        }
        leftHeihgt = this.getHeightInDocOfText(item.title, 'title', item.leftWidth || leftWidth)
        item.height = leftHeihgt
        if (item.notify) {
          let rightWidth = item.width - leftWidth - 2
          if (item.leftWidth) {
            rightWidth = rightWidth - item.leftWidth + leftWidth
          }
          let rightHeight = this.getHeightInDocOfText(item.notify, 'notify', rightWidth)
          if (rightHeight > item.height) {
            item.height = rightHeight
          }
        } else {
          // 流程为判断，需要调整宽高
          leftWidth = this.getWidthInDocOfText(item.title, 'title rhombus')
          if (leftWidth > item.width) {
            item.leftWidth = item.width
          }
          leftHeihgt = this.getHeightInDocOfText(item.title, 'title rhombus', item.width)
          if (leftHeihgt > item.height) {
            item.height = leftHeihgt
          }
          let beforeLine = index * (item.width + .05 * currentModuleWidth) + item.width / 2
          leftWidth = this.getWidthInDocOfText(item.title, 'title rhombus')
          if (leftWidth < item.width) {
            item.width = leftWidth
            item.x = lineOther.length === 1 ? beforeModuleWidth + (currentModuleWidth - item.width) / 2 : beforeModuleWidth + beforeLine - item.width / 2
          }
        }
        item.height += 2
        if (!linesHeight[item.line - 1] || linesHeight[item.line - 1] < item.height) {
          linesHeight[item.line - 1] = item.height
        }
      })
      beforeModuleWidth += currentModuleWidth
    })

    // 调整每一行流程对应的y坐标
    this.flowChart.forEach((flow) => {
      flow.list.forEach(item => {
        if (item.line === 1) {
          item.y = this.contentTop
        } else {
          item.y = this.contentTop + linesHeight.slice(0, item.line - 1).reduce((a, b) => a + b, 0) + (item.line - 1) * this.spaceHeight
        }
      })
    })

    // 计算流向集索命
    this.flowChart.forEach((flow) => {
      flow.list.forEach((item) => {
        if (!item.to) return;
        item.to.forEach(titem => {
          let id = titem
          if (typeof titem !== 'number') {
            id = titem.id
          }
          let text = '', extendColor
          if (typeof titem !== 'number') {
            text = titem.text
            extendColor = titem.color
          }
          this.getPathOfFlowDirection({ id, start: item, text, extendColor })
        })
      })
    })

    // 计算总高度
    let contentHeight = linesHeight.reduce((a, b) => a + b, 0) + linesHeight.length * this.spaceHeight + this.contentBottom - this.spaceHeight
    this.drawFlowChart(contentHeight, columns)
  }

  // 流程图绘制
  drawFlowChart(contentHeight, columns) {
    let doc = document.getElementById(this.elemId)
    let str = ''
    let svgStr = '<svg width="100%" height="100%" style="position: absolute">'
    let svgText = '', afterLines = ''
    this.flowChart.forEach((flow) => {
      str += `<div class="flow-module-box" style="width: ${flow.lines * 100 / columns}%"><div class="title">${flow.title}</div><div class="content" style="height: ${contentHeight}px">`
      flow.list.forEach(item => {
        str += `<div class="item-flow" style="top: ${item.y}px;left: ${item.x}px; width: ${item.width}px;${item.notify ? '' : ' border: none'}">
                <div class="title${item.notify ? '' : ' rhombus'}"${item.leftWidth ? ` style="width: ${item.leftWidth}px;white-space: normal;"` : ''}>${item.title}</div>
                ${item.notify ? `<div class="notify">${item.notify}</div>` : ''}</div>`;
        if (item.beforeLines) {
          item.beforeLines.forEach(d => {
            svgStr += d
          })
        }
        if (item.afterLines) {
          item.afterLines.forEach(d => {
            afterLines += d
          })
        }
        if (item.arrow) {
          item.arrow.forEach(arrow => {
            svgStr += arrow
          })
        }
      })
      str += `</div></div>`
    })

    this.calibrationPositionOfText()
    // 绘制说明
    this.textList.forEach(text => {
      let rect = `<rect x="${text.x - this.textDistance / 2}" y="${text.y - this.textDistance * .8}" width="${text.width + this.textDistance}" height="${text.height}" fill="#F9FAFC"></rect>`
      let textStr = '', rowIndex = 0
      for (let i = 0; i < text.text.length; i += 4) {
        textStr += `<text x="${text.x}" y="${text.y + rowIndex * this.lineHeight}" font-size="${this.fontSize}" fill="#3d3d3d">${text.text.slice(i, i + 4)}</text>`
        rowIndex++
      }
      svgText += (rect + textStr)
    })

    // 调整线条和说明的层级先后
    svgStr += afterLines + svgText + '</svg>'
    doc.innerHTML = str + svgStr
  }

  // 计算流向线条的绘制路径和箭头方向
  getPathOfFlowDirection(data) {
    let { id, start, text, extendColor } = data
    let temp
    this.flowChart.forEach((flow) => {
      let ftemp = flow.list.find(item => item.id === id)
      if (ftemp) {
        temp = ftemp
      }
    })
    if (!temp) return temp;
    let spaceItems = []
    this.flowChart.forEach((flow) => {
      let items = flow.list.filter(item => {
        if ([id, start.id].includes(item.id)) return false
        if (start.module > temp.module && (item.module < temp.module || item.module > start.module)) return false
        if (start.module < temp.module && (item.module > temp.module || item.module < start.module)) return false
        if (start.module === temp.module && item.module !== start.module) return false
        if (start.line > temp.line && (item.line < temp.line || item.line > start.line)) return false
        if (start.line < temp.line && (item.line > temp.line || item.line < start.line)) return false
        if (start.module < temp.module && (item.module > temp.module || item.module < start.module)) return false
        if (start.line === temp.line && item.line !== start.line) return false
        return true
      })
      if (items) {
        spaceItems.push(...items)
      }
    })
    let { points, arrowType } = this.getDOfFlowDirection(start, temp, spaceItems)

    if (arrowType && points) {
      this.pathList.push({ arrowType, points })
      let lineType = 'beforeLines'
      if (extendColor && this.lineColor !== extendColor) {
        lineType = 'afterLines'
      }
      temp[lineType] = temp[lineType] || []
      let d = '', endPoint = points[points.length - 1]

      let arrowInfo = this.getArrowOfFlowDirection(arrowType, endPoint)
      temp.arrow = temp.arrow || []
      temp.arrow.push(`<path d="${arrowInfo.arrow}" fill="${extendColor || this.lineColor}"/>`)

      points.forEach((point, index) => {
        if (index === 0) {
          d += `M ${point[0]} ${point[1]} `
        } else if (index === points.length - 1) {
          d += ` L ${arrowInfo.end[0]} ${arrowInfo.end[1]}`
        } else {
          d += this.getMiddlePointOfFlowDirection(points[index - 1], point, points[index + 1])
        }
      })
      temp[lineType].push(`<path d="${d}" stroke="${extendColor || this.lineColor}" stroke-width="${this.lineWidth}" fill="none"${extendColor && this.lineColor !== extendColor ? ' stroke-dasharray="5,5"' : ''}/>`)
      if (text) {
        this.getTextOfFlowDirection(text, points, [id, start.id])
      }
    }
  }
  // 根据方向获取箭头的绘制路径
  getArrowOfFlowDirection(direction, point) {
    if (direction === 'top') {
      return {
        arrow: `M ${point[0]} ${point[1]} L ${point[0] - this.arrowWidth} ${point[1] - this.arrowHeight} L ${point[0] + this.arrowWidth} ${point[1] - this.arrowHeight} Z`,
        end: [point[0], point[1] - this.arrowHeight]
      }
    } else if (direction === 'bottom') {
      return {
        arrow: `M ${point[0]} ${point[1]} L ${point[0] - this.arrowWidth} ${point[1] + this.arrowHeight} L ${point[0] + this.arrowWidth} ${point[1] + this.arrowHeight} Z`,
        end: [point[0], point[1] + this.arrowHeight]
      }
    } else if (direction === 'left') {
      return {
        arrow: `M ${point[0]} ${point[1]} L ${point[0] - this.arrowHeight} ${point[1] - this.arrowWidth} L ${point[0] - this.arrowHeight} ${point[1] + this.arrowWidth} Z`,
        end: [point[0] - this.arrowHeight, point[1]]
      }
    } else if (direction === 'right') {
      return {
        arrow: `M ${point[0]} ${point[1]} L ${point[0] + this.arrowHeight} ${point[1] - this.arrowWidth} L ${point[0] + this.arrowHeight} ${point[1] + this.arrowWidth} Z`,
        end: [point[0] + this.arrowHeight, point[1]]
      }
    }
    return ''
  }

  // 获取文字填充到元素后，应有的高度
  getHeightInDocOfText(text, type, width) {
    let curWidth = width - this.paddingLeft - this.paddingRight
    let doc = document.getElementById('getHeightInDocOfText')
    if (doc) {
      doc.innerText = text
      doc.classList.value = type + ' simulate'
      doc.style.width = curWidth + 'px'
      return doc.getBoundingClientRect().height
    }
    return 0
  }
  // 获取文字填充到袁术后，应有的宽度
  getWidthInDocOfText(text, type) {
    let doc = document.getElementById('getWidthInDocOfText')
    if (doc) {
      doc.innerText = text
      doc.classList.value = type + ' simulate'
    } else {
      let doc = `<div style="width: fit-content;white-space:nowrap;" class="${type}" id="getWidthInDocOfText">${text}</div>
          <div id="getHeightInDocOfText" style="white-space:wrap;"></div>`
      document.body.insertAdjacentHTML('beforeend', doc)
    }

    let width = document.getElementById('getWidthInDocOfText').getBoundingClientRect().width
    return width
  }

  // 获取起点到终点合适的路径
  getDOfFlowDirection(startPoint, endPoint, spaceItems, allExtreme = true) {
    let middleSX = startPoint.x + startPoint.width / 2, middleTX = endPoint.x + endPoint.width / 2
    let middleSY = startPoint.y + startPoint.height / 2, middleTY = endPoint.y + endPoint.height / 2
    let endSX = startPoint.x + startPoint.width, endSY = startPoint.y + startPoint.height
    let endTX = endPoint.x + endPoint.width, endTY = endPoint.y + endPoint.height
    let isSpace = !!spaceItems.length
    let ids = [startPoint.id, endPoint.id]

    let arrowType = '', points = []
    if (!isSpace) {
      if (Math.abs(middleSX - middleTX) < 3) {
        let psy = startPoint.y, pty = endPoint.y
        if (startPoint.y + this.flowSpace < endPoint.y) {
          arrowType = 'top'
          psy += startPoint.height
        }
        if (startPoint.y > endPoint.y + this.flowSpace) {
          arrowType = 'bottom'
          pty += endPoint.height
        }
        points = [[middleSX, psy], [middleSX, pty]]
        let result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
        if (result) return result
      }
      if (startPoint.line === endPoint.line) {
        let psx = startPoint.x, ptx = endPoint.x
        let psy = middleSY, middleX
        if (middleSY > middleTY) {
          psy = middleTY
        }
        if (endSX + this.flowSpace < endPoint.x) {
          arrowType = 'left'
          psx += startPoint.width
          middleX = ptx - this.flowSpace
        }
        if (startPoint.x > endTX + this.flowSpace) {
          arrowType = 'right'
          ptx += endPoint.width
          middleX = ptx + this.flowSpace
        }
        if (Math.abs(middleSY - middleTY) < 3) {
          points = [[psx, psy], [ptx, psy]]
        } else {
          points = [[psx, middleSY], [middleX, middleSY], [middleX, middleTY], [ptx, middleTY]]
        }

        let result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
        if (result) return result
      }
    }
    if (startPoint.line === endPoint.line) {
      points = [[middleSX, startPoint.y], [middleSX, startPoint.y - this.flowSpace], [middleTX, startPoint.y - this.flowSpace], [middleTX, endPoint.y]]

      let result = this.judge('top', points, ids, startPoint, endPoint, allExtreme)
      if (result) return result
      points = [[middleSX, endSY], [middleSX, endSY + this.flowSpace], [middleTX, endSY + this.flowSpace], [middleTX, endTY]]
      result = this.judge('bottom', points, ids, startPoint, endPoint, allExtreme)
      if (result) return result
    }

    let psx = endSX, ptx = middleTX
    let psy = middleSY, pty = endPoint.y
    arrowType = 'top'
    if (endTY < startPoint.y - this.flowSpace) {
      pty = endTY
      arrowType = 'bottom'
    }
    if (middleTX + this.flowSpace < startPoint.x) {
      psx = startPoint.x
    }
    points = [[psx, psy], [ptx, psy], [ptx, pty]]
    let result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme, middleTX + this.flowSpace < startPoint.x || endSX + this.flowSpace < middleTX)
    if (result) return result

    psx = middleSX, psy = endSY, ptx = endPoint.x, pty = middleTY
    if (endTY < startPoint.y - this.flowSpace) {
      psy = startPoint.y
    }
    arrowType = 'left'
    if (middleSX > endTX + this.flowSpace) {
      arrowType = 'right'
      ptx = endTX
    }
    points = [[psx, psy], [psx, pty], [ptx, pty]]
    result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme, middleSX > endTX + this.flowSpace || middleSX < endPoint.x - this.flowSpace)
    if (result) return result

    psx = middleSX, psy = endSY, ptx = middleTX, pty = endPoint.y
    arrowType = 'top'
    let middleY = pty - this.flowSpace
    if (startPoint.y > endTY + this.flowSpace) {
      psy = startPoint.y
      pty = endTY
      arrowType = 'bottom'
      middleY = pty + this.flowSpace
    }
    points = [[psx, psy], [psx, middleY], [ptx, middleY], [ptx, pty]]
    result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
    if (result) return result
    middleY = psy + this.flowSpace
    if (startPoint.y > endTY + this.flowSpace) {
      middleY = psy - this.flowSpace
    }
    points = [[psx, psy], [psx, middleY], [ptx, middleY], [ptx, pty]]
    result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
    if (result) return result

    let maxSpaceX = 0, minSpaceX = 10000
    maxSpaceX = Math.max(...spaceItems.map(item => item.x + item.width), endSX, endTX) + this.flowSpace
    minSpaceX = Math.min(...spaceItems.map(item => item.x), startPoint.x, endPoint.x) - this.flowSpace
    points = [[startPoint.x, middleSY], [minSpaceX, middleSY], [minSpaceX, middleTY], [endPoint.x, middleTY]]
    result = this.judge('left', points, ids, startPoint, endPoint, allExtreme)
    if (result) return result
    points = [[endSX, middleSY], [maxSpaceX, middleSY], [maxSpaceX, middleTY], [endTX, middleTY]]
    result = this.judge('right', points, ids, startPoint, endPoint, allExtreme)
    if (result) return result

    psy = startPoint.y, middleY = psy - this.flowSpace
    if (endPoint.y > endSY + this.flowSpace) {
      psy = endSY
      middleY = psy + this.flowSpace
    }
    points = [[middleSX, psy], [middleSX, middleY], [minSpaceX, middleY], [minSpaceX, middleTY], [endPoint.x, middleTY]]
    result = this.judge('left', points, ids, startPoint, endPoint, allExtreme)
    if (result) return result
    points = [[middleSX, psy], [middleSX, middleY], [maxSpaceX, middleY], [maxSpaceX, middleTY], [endPoint.x, middleTY]]
    result = this.judge('right', points, ids, startPoint, endPoint, allExtreme)
    if (result) return result

    psx = startPoint.x, psy = middleSY, ptx = endPoint.x, pty = middleTY, middleY = startPoint.y - this.flowSpace
    let middleX2 = ptx - this.flowSpace
    let middleX = psx - this.flowSpace
    arrowType = 'left'
    if (endPoint.x > endSX + this.flowSpace) {
      ptx = endTX
      psx = endTX
      middleX2 = ptx + this.flowSpace
      middleX = psx + this.flowSpace
      arrowType = 'right'
    }
    if (endPoint.y > endTY + this.flowSpace) {
      middleY = pty + this.flowSpace
    }
    points = [[psx, psy], [middleX, psy], [middleX, middleY], [middleX2, middleY], [middleX2, pty], [ptx, pty]]
    result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
    if (result) return result

    psx = middleSX, psy = startPoint.y, ptx = middleTX, pty = endTY
    arrowType = 'bottom'
    middleX = Math.max(endSX, endTX) + this.flowSpace, middleY = psy - this.flowSpace
    let middleY1 = pty + this.flowSpace
    if (endSY < endPoint.y - this.flowSpace) {
      arrowType = 'top'
      pty = endSY,
        pty = endPoint.y
      middleY = psy + this.flowSpace
      middleY1 = pty - this.flowSpace
    }
    points = [[psx, psy], [psx, middleY], [middleX, middleY], [middleX, middleY1], [ptx, middleY1], [ptx, pty]]
    result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
    if (result) return result
    middleX = Math.min(endPoint.x, startPoint.x) - this.flowSpace
    points = [[psx, psy], [psx, middleY], [middleX, middleY], [middleX, middleY1], [ptx, middleY1], [ptx, pty]]
    result = this.judge(arrowType, points, ids, startPoint, endPoint, allExtreme)
    if (result) return result

    return allExtreme ? this.getDOfFlowDirection(startPoint, endPoint, spaceItems, false) : { arrowType: '', points: [] }
  }

  // 判断路径是否可用
  judge(arrowType, points, ids, startPoint, endPoint, allExtreme = true, condition = true) {
    if (!this.pathIsCrossItem(points, ids) && condition && this.startingPointLimitation(startPoint, endPoint, points)) {
      if (allExtreme && !this.isUsedExtremePoint(points) || !allExtreme && this.extremePointIsSame(points)) {
        let dealPoint = this.lineCorrection(points, ids)
        if (dealPoint.change !== -1) {
          return { arrowType, points: dealPoint.points }
        }
      }
    }

    return
  }

  // 判断路径是否会穿过元素
  pathIsCrossItem(points, ids) {
    let isCross = false
    for (let i = 0; i < points.length - 1; i++) {
      let start = points[i], end = points[i + 1]
      isCross = this.flowChart.some((flow) => {
        return flow.list.some(item => {
          if (ids.includes(item.id)) return false;
          if (start[0] === end[0]) {
            if (start[0] < item.x || start[0] > item.x + item.width) return false
            if (start[1] > end[1] && (start[1] < item.y || end[1] > item.y + item.height)) return false
            if (start[1] < end[1] && (end[1] < item.y || start[1] > item.y + item.height)) return false
            return true
          }
          if (start[1] === end[1]) {
            if (start[1] < item.y || start[1] > item.y + item.height) return false
            if (start[0] > end[0] && (start[0] < item.x || end[0] > item.x + item.width)) return false
            if (start[0] < end[0] && (end[0] < item.x || start[0] > item.x + item.width)) return false
            return true
          }
        })
      })
      if (isCross) {
        return isCross
      }
    }
    return isCross
  }

  isOverlapping(points) {
    let isOverlapping = false
    for (let i = 0; i < points.length - 1; i++) {
      let ps = points[i], pe = points[i + 1], pp, pn
      if (i > 0) {
        pp = points[i - 1]
      }
      if (i < points.length - 2) {
        pn = points[i + 2]
      }
      isOverlapping = this.pathList.some(line => {
        let linePoint = line.points
        for (let j = 0; j < linePoint.length - 1; j++) {
          let ls = linePoint[j], le = linePoint[j + 1], lp, ln

          if (j > 0) {
            lp = linePoint[j - 1]
          }
          if (j < linePoint.length - 2) {
            ln = linePoint[j + 2]
          }
          if (pp && lp && pp[0] === lp[0] && pp[1] === lp[1]) return false
          if (pn && ln && pn[0] === ln[0] && pn[1] === ln[1]) return false
          if (!pn && !ln && pe[0] === le[0] && pe[1] === le[1]) return false;
          if (!pp && !lp && ps[0] === ls[0] && ps[1] === ls[1]) return false;
          if (ps[0] === pe[0]) {
            return this.compareLineSegment(ps, pe, ls, le)
          }
          if (ps[1] === pe[1]) {
            return this.compareLineSegment(ps, pe, ls, le, 'longitudinal')
          }
          return false
        }
        return false
      })
      if (isOverlapping) {
        break
      }
    }
    return isOverlapping
  }

  // 线条路径调整
  lineCorrection(points, ids) {
    let data = { points, change: 0 }
    let flowSpaceSize = 3
    if (points.length < 3) {
      return data
    }
    let changeFlag = false
    for (let i = 0; i < points.length - 1; i++) {
      let ps = points[i], pe = points[i + 1], pp, pn
      if (i > 0) {
        pp = points[i - 1]
      }
      if (i < points.length - 2) {
        pn = points[i + 2]
      }
      this.pathList.forEach(line => {
        let linePoint = line.points
        for (let j = 0; j < linePoint.length - 1; j++) {
          let ls = linePoint[j], le = linePoint[j + 1], lp, ln

          if (j > 0) {
            lp = linePoint[j - 1]
          }
          if (j < linePoint.length - 2) {
            ln = linePoint[j + 2]
          }
          if (pp && lp && pp[0] === lp[0] && pp[1] === lp[1]) continue;
          if (pn && ln && pn[0] === ln[0] && pn[1] === ln[1]) continue;
          if (!pn && !ln && pe[0] === le[0] && pe[1] === le[1]) continue;
          if (!pp && !lp && ps[0] === ls[0] && ps[1] === ls[1]) continue;
          if (this.compareLineSegment(ps, pe, ls, le)) {
            if (!pn) {
              changeFlag = true;
              break;
            }
            let flag = 0
            if (pp && pp[0] > ps[0] || pn && pn[0] > ps[0]) {
              flag = -1
            }
            if (pp && pp[0] < ps[0] || pn && pn[0] < ps[0]) {
              flag = 1
            }
            if (flag !== 0) {
              let tempPoints = JSON.parse(JSON.stringify(points))
              for (let k = 1; k < flowSpaceSize; k++) {
                tempPoints[i][0] = ps[0] + k * this.flowSpace * flag
                tempPoints[i + 1][0] = ps[0] + k * this.flowSpace * flag
                if (!this.isOverlapping(tempPoints) && !this.pathIsCrossItem(tempPoints, ids)) {
                  data.change = 1
                  data.points = tempPoints
                  break
                }
              }
              if (data.change !== 1) {
                data.change = -1
              }
            } else {
              data.change = -1
            }
          }
          if (this.compareLineSegment(ps, pe, ls, le, 'longitudinal')) {
            if (!pn) {
              changeFlag = true;
              break;
            }
            let flag = 0
            if (pp && pp[1] > ps[1] || pn && pn[1] > ps[1]) {
              flag = 1
            }
            if (pp && pp[1] < ps[1] || pn && pn[1] < ps[1]) {
              flag = -1
            }
            if (flag !== 0) {
              let tempPoints = JSON.parse(JSON.stringify(points))
              for (let k = 1; k < flowSpaceSize; k++) {
                tempPoints[i][1] = ps[1] + k * this.flowSpace * flag
                tempPoints[i + 1][1] = ps[1] + k * this.flowSpace * flag
                if (!this.isOverlapping(tempPoints) && !this.pathIsCrossItem(tempPoints, ids)) {
                  data.change = 1
                  data.points = tempPoints
                  break
                }
              }
              if (data.change !== 1) {
                data.change = -1
              }
            } else {
              data.change = -1
            }
          }
        }
      })
    }
    if (changeFlag) {
      data.change = -1
    }
    return data
  }

  // 判断起点、终点被使用情况
  isUsedExtremePoint(points, direction = 'extreme') {
    let start = points[0], end = points[points.length - 1]
    if (!Array.isArray(this.pathList) || this.pathList.length < 1) return false
    return this.pathList.some(line => {
      let linePoint = line.points
      if (!Array.isArray(linePoint) || linePoint.length < 1) return false
      let ls = linePoint[0]
      let le = linePoint[linePoint.length - 1]
      if (direction === 'start' && start[0] === ls[0] && ls[1] === start[1]) {
        return true
      }
      if (direction === 'end' && end[0] === le[0] && le[1] === end[1]) {
        return true
      }
      if (direction !== 'extreme') return false
      if (start[0] === ls[0] && ls[1] === start[1]) return true
      if (end[0] === le[0] && le[1] === end[1]) return true
      if (start[0] === le[0] && le[1] === start[1]) return true
      if (end[0] === ls[0] && ls[1] === end[1]) return true
      return false
    })
  }

  extremePointIsSame(points) {
    let start = points[0], end = points[points.length - 1]
    return this.pathList.every(line => {
      let linePoint = line.points
      if (!Array.isArray(linePoint) || linePoint.length < 1) return false
      let ls = linePoint[0]
      let le = linePoint[linePoint.length - 1]
      if (start[0] === le[0] && start[1] === le[1]) return false
      if (end[0] === ls[0] && end[1] === ls[1]) return false
      return true
    })
  }

  // 判断元素的起点、终点个数是否超过限制
  startingPointLimitation(startPoint, endPoint, points) {
    if (!this.isUsedExtremePoint(points, 'start') && this.isUsedExtremePoint(points, 'end')) {
      return this.judgePoint(startPoint, points[0], 'start')
    }
    if (!this.isUsedExtremePoint(points, 'end') && this.isUsedExtremePoint(points, 'start')) {
      return this.judgePoint(endPoint, points[points.length - 1], 'end')
    }
    if (!this.isUsedExtremePoint(points, 'end') && !this.isUsedExtremePoint(points, 'start')) {
      let temp = this.judgePoint(startPoint, points[0], 'start')
      if (!temp) return false
      return this.judgePoint(endPoint, points[points.length - 1], 'end')
    }
    return true
  }

  // 限制每个元素至多有两个起点、两个终点
  judgePoint(dot, point, type) {
    let dealPoint = [[dot.x, dot.y + dot.height / 2], [dot.x + dot.width / 2, dot.y], [dot.x + dot.width, dot.y + dot.height / 2], [dot.x + dot.width / 2, dot.y + dot.height]]
    dealPoint = dealPoint.filter(item => item[0] !== point[0] || item[1] !== point[1])
    let result = new Array(dealPoint.length).fill(0)
    this.pathList.forEach(line => {
      let tempPoint = line.points[type === 'start' ? 0 : line.points.length - 1]
      dealPoint.forEach((item, index) => {
        if (item[0] === tempPoint[0] && item[1] === tempPoint[1]) {
          result[index] += 1
        }
      })
    })
    if (result.filter(item => item !== 0).length < 2) {
      return true
    }
    return false
  }

  // 获取路径中间节点的绘制
  getMiddlePointOfFlowDirection(point1, point2, point3) {
    if (point1[0] === point2[0]) {
      if (point1[1] > point2[1]) {
        if (point3[0] > point2[0]) {
          return ` L ${point2[0]} ${point2[1] + this.radius} A ${this.radius} ${this.radius} 0 0 1 ${point2[0] + this.radius} ${point2[1]}`
        } else {
          return ` L ${point2[0]} ${point2[1] + this.radius} A ${this.radius} ${this.radius} 0 0 0 ${point2[0] - this.radius} ${point2[1]}`
        }
      } else {
        if (point3[0] > point2[0]) {
          return ` L ${point2[0]} ${point2[1] - this.radius} A ${this.radius} ${this.radius} 0 0 0 ${point2[0] + this.radius} ${point2[1]}`
        } else {
          return ` L ${point2[0]} ${point2[1] - this.radius} A ${this.radius} ${this.radius} 0 0 1 ${point2[0] - this.radius} ${point2[1]}`
        }
      }
    }
    if (point1[1] == point2[1]) {
      if (point1[0] > point2[0]) {
        if (point3[1] > point2[1]) {
          return ` L ${point2[0] + this.radius} ${point2[1]} A ${this.radius} ${this.radius} 0 0 0 ${point2[0]} ${point2[1] + this.radius}`
        } else {
          return ` L ${point2[0] + this.radius} ${point2[1]} A ${this.radius} ${this.radius} 0 0 1 ${point2[0]} ${point2[1] - this.radius}`
        }
      } else {
        if (point3[1] > point2[1]) {
          return ` L ${point2[0] - this.radius} ${point2[1]} A ${this.radius} ${this.radius} 0 0 1 ${point2[0]} ${point2[1] + this.radius}`
        } else {
          return ` L ${point2[0] - this.radius} ${point2[1]} A ${this.radius} ${this.radius} 0 0 0 ${point2[0]} ${point2[1] - this.radius}`
        }
      }
    }
  }

  // 获取线条补充信息的绘制信息
  getTextOfFlowDirection(text, points, ids) {
    let maxLength = 4 * this.fontSize
    let row = this.getRowsWithWidthInFlowChart(text, maxLength + 10)
    let textWidth = 0, textHeight = 0
    textHeight = row * this.lineHeight
    if (row > 1) {
      textWidth = maxLength
    } else {
      textWidth = this.getPxOfTextInFlowChart(text) * this.fontSize
    }

    let tempText = { text, points, width: textWidth, height: textHeight, ids }
    for (let i = 0; i < points.length - 1; i++) {
      let startPoint = points[i], endPoint = points[i + 1]
      tempText.usedLineSegment = i
      if (startPoint[0] === endPoint[0] && Math.abs(startPoint[1] - endPoint[1]) > textHeight + 20) {
        tempText.x = startPoint[0] - textWidth / 2
        tempText.y = (startPoint[1] + endPoint[1]) / 2 - textHeight / 2 + this.lineHeight * .5
        if (this.createNewText(tempText) && !this.judgeTextCross(tempText)) {
          tempText.has = true
          break
        }
      }
      if (startPoint[1] === endPoint[1] && Math.abs(startPoint[0] - endPoint[0]) > this.textDistance + textWidth) {
        tempText.y = startPoint[1] - textHeight * .5 + this.lineHeight * .7
        tempText.x = (startPoint[0] + endPoint[0]) / 2 - textWidth / 2
        if (this.createNewText(tempText) && !this.judgeTextCross(tempText)) {
          tempText.has = true
          break
        }
      }
    }

    if (this.createNewText(tempText)) {
      this.textList.push(tempText)
    }
  }

  // 判断线条补充信息绘制位置是否重叠
  judgeTextCross(textBox) {
    let dealList = this.textList.filter(item => item.has)
    if (dealList.length < 1) return false
    return dealList.some(text => {
      if (text.ids[0] === textBox.ids[0] && text.ids[1] === textBox.ids[1]) {
        return false
      }
      if (textBox.x > text.x + text.width || textBox.x + textBox.width < text.x) {
        return false
      }
      if (textBox.y > text.y + text.height || textBox.y + textBox.height < text.y) {
        return false
      }
      if (textBox.y !== text.y && textBox.x !== text.x) {
        return false
      }
      return true
    })
  }

  // 判断是否需要将线条补充信息绘制出来
  createNewText(textBox) {
    let dealList = this.textList.filter(item => item.has)
    if (dealList.length < 1) return true
    return dealList.every(text => {
      if (text.text !== textBox.text) {
        return true
      }
      let bs = textBox.points[0], ts = text.points[0]
      if (bs[0] !== ts[0] || bs[1] !== ts[1]) {
        return true
      }
      if (text.x === textBox.x && textBox.y > text.y) {
        text.y = textBox.y
        text.usedLineSegment = textBox.usedLineSegment
      }
      if (text.y === textBox.y && textBox.x > text.x) {
        text.x = textBox.x
        text.usedLineSegment = textBox.usedLineSegment
      }
      return false
    })
  }

  // 获取文字对应px值
  getPxOfTextInFlowChart(value) {
    return value.replace(/[^\x00-\xff]/gi, 'aa').length / 2
  }

  // 获取限制宽度下文字填充到元素，文字的行数
  getRowsWithWidthInFlowChart(value, width) {
    let rows = 0, rwidth = 0;
    for (let i = 0; i < value.length; i++) {
      rwidth += this.getPxOfTextInFlowChart(value[i]) * this.fontSize
      if (rwidth >= width) {
        rows += 1
        rwidth -= width
      }
    }
    rows += 1
    return rows
  }

  // 判断两条线段是否重叠
  compareLineSegment(ps, pe, ls, le, direction = 'horizontal') {
    let equal = 0, unequal = 1
    if (direction !== 'horizontal') {
      equal = 1, unequal = 0
    }
    if (ps[equal] !== pe[equal]) return false;
    if (ls[equal] !== le[equal] || ls[equal] !== ps[equal]) return false;
    if (ps[unequal] > pe[unequal] && ls[unequal] > le[unequal] && le[unequal] > ps[unequal]) return false;
    if (ps[unequal] > pe[unequal] && ls[unequal] > le[unequal] && ls[unequal] < pe[unequal]) return false;
    if (ps[unequal] > pe[unequal] && ls[unequal] < le[unequal] && ls[unequal] > ps[unequal]) return false;
    if (ps[unequal] > pe[unequal] && ls[unequal] < le[unequal] && le[unequal] < pe[unequal]) return false;
    if (ps[unequal] < pe[unequal] && ls[unequal] > le[unequal] && ls[unequal] < ps[unequal]) return false;
    if (ps[unequal] < pe[unequal] && ls[unequal] > le[unequal] && le[unequal] > pe[unequal]) return false;
    if (ps[unequal] < pe[unequal] && ls[unequal] < le[unequal] && le[unequal] < ps[unequal]) return false;
    if (ps[unequal] < pe[unequal] && ls[unequal] < le[unequal] && ls[unequal] > pe[unequal]) return false;
    return true
  }

  // 调整线条提示信息绘制位置
  calibrationPositionOfText() {
    let dealList = this.textList.filter(item => item.has)
    let length = dealList.length
    for (let i = 0; i < length; i++) {
      let cur = dealList[i]
      for (let j = 0; j < length; j++) {
        if (i === j) {
          continue;
        }
        let com = dealList[j]

        let bs = cur.points[0], be = cur.points[1]
        let ts = com.points[0], te = com.points[1]
        if (this.compareLineSegment(bs, be, ts, te) || this.compareLineSegment(bs, be, ts, te, 'longitudinal')) {
          let centerX = cur.x + cur.width / 2, cbx = (bs[0] + be[0]) / 2
          if (Math.abs(centerX - cbx) < 3 && cur.points.length - cur.usedLineSegment > 2) {
            let flag = false, bx = cur.x, by = cur.y
            for (let z = cur.usedLineSegment + 1, len = cur.points.length - 1; z < len; z++) {
              let startPoint = cur.points[z], endPoint = cur.points[z + 1]
              if (startPoint[0] === endPoint[0] && Math.abs(startPoint[1] - endPoint[1]) > cur.height + 20) {
                cur.x = startPoint[0] - cur.width / 2
                cur.y = (startPoint[1] + endPoint[1]) / 2 - cur.height / 2 + this.lineHeight * .5
                if (!this.judgeTextCross(cur)) {
                  flag = true
                  cur.usedLineSegment = z
                  break
                }
              }
              if (startPoint[1] === endPoint[1] && Math.abs(startPoint[0] - endPoint[0]) > this.textDistance + cur.width) {
                cur.y = startPoint[1] - cur.height * .5 + this.lineHeight * .7
                cur.x = (startPoint[0] + endPoint[0]) / 2 - cur.width / 2
                if (!this.judgeTextCross(cur)) {
                  flag = true
                  cur.usedLineSegment = z
                  break
                }
              }
            }
            if (!flag) {
              cur.x = bx
              cur.y = by
            }
          }
        }
      }
    }
  }
}