class GuaCamera extends GuaObject {
    constructor() {
        super()
        // 镜头在世界坐标系中的坐标
        // this.position = GuaVector.new(0, 0, -10)
        this.position = GuaVector.new(config.camera_position_x.value, config.camera_position_y.value, config.camera_position_z.value)
        // log('this.position', this.position)
        // 镜头看的地方
        // this.target = GuaVector.new(0, 1, 0)
        this.target = GuaVector.new(config.camera_target_x.value, config.camera_target_y.value, config.camera_target_z.value)
        // log('this.target', this.target)
        // 镜头向上的方向
        // this.up = GuaVector.new(0, 1, 0)
        this.up = GuaVector.new(config.camera_up_x.value, config.camera_up_y.value, config.camera_up_z.value)
        // log('this.up', this.up)
        this.cn = this.position.sub(this.target)

        // log('this.cn', this.cn)

    }
}

class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        // this.pixelBuffer = this.pixels.data
        this.zBuffer = []
        // zBuffer init
        for (let i = 0; i < this.w; i++) {
            let a = []
            for (let j = 0; j < this.h; j++) {
                a.push(0)
            }
            this.zBuffer.push(a)
        }
        // gbuffer
        this.gbuffer = GuaGBuffer.new(this.w, this.h)


        this.camera = GuaCamera.new()
        this.img = null
        this.light = GuaVector.new(5, 5, 5)
        this.cos = 0
        // log(this.zBuffer[10][10])
    }

    project(coordVertex, transformMatrix) {
        let {w, h} = this
        let [w2, h2] = [w/2, h/2]
        let point = transformMatrix.transform(coordVertex.position)
        let x = point.x * w2 + w2
        let y = - point.y * h2 + h2
        let z = -point.z * 1 +1
        let p = GuaVector.new(x, y, z)
        return GuaVertex.new(p, coordVertex.color, coordVertex.n, coordVertex.u, coordVertex.v)
    }

    render() {
        let {pixels, context} = this
        // log(this.gbuffer.colorBuffer[100][100])
        this.setPixelFromColorBuffer()
        // log('render')
        context.putImageData(pixels, 0, 0)
    }

    clear(color=GuaColor.white()) {
        // color GuaColor
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color)
                x = Math.round(x), y = Math.round(y)
                // log('xy ', x,y)
                try{
                    this.zBuffer[x][y] = 0
                }catch(error){
                    log('xy ', x,y)
                }
            }
        }
        log('clear over ')
        let {pixels, context} = this

        context.putImageData(pixels, 0, 0)
        // this.render()
    }

    calculateCos(light, tn, worldTrianglePosition) {
      let p = worldTrianglePosition
      // let n = worldTriangleNormal
      // //三角形的中心点
      // let triCen = GuaVector.center(p[0], p[1], p[2])
      // //三角形的法向量
      // let tn = GuaVector.center(n[0],n[1],n[2])
      //光线向量
      let ln = p.sub(light)
      let cos = ln.cos(tn)
      return cos
    }

    calculateLightColor (color, normal, position) {
      // let worldTrianglePosition = [a.position, b.position, c.position].map(v => world.transform(v))
      // let worldTriangleNormal = [a.n, b.n, c.n].map(v => rotation.transform(v))
      // let [a2, b2, c2] = [a1, b1, c1].map(v => this.project(v, trans))
      // log('worldTriangle', worldTriangle)
      let lightColor
      if(normal.x != undefined)
      {
        let ln = (position.sub(this.light)).normalize()
        let cos = ln.cos(normal.normalize())
        // log(cos)
        // let cos = this.calculateCos(this.light, normal, position)
          if (cos > 1) {
              cos = 1
          } else if (cos < 0) {
              cos = 0
          }
          // log(linColor.r, typeof(linColor.r))
          // if (cos <= 1 && cos >= 0 ){
          let factor = 0.7 + cos * 0.3
          // let factor = 1
          // if(color.r * factor >= 255){
          //     log(color.r)
          // }
          // log(color.r, color.g, color.b)
          let r = Math.min(color.r * factor, 255)
          let g = Math.min(color.g * factor, 255)
          let b = Math.min(color.b * factor, 255)
          lightColor = GuaColor.new(r, g, b, color.a)

      }else {
        lightColor = GuaColor.new(255, 255, 255, color.a)
      }

                // if(lightColor.r == 0)
                // {
                //   log(color)
                // }

        return lightColor

    }

    setPixelFromColorBuffer () {
        let colorBuffer = this.gbuffer.colorBuffer
        let normalBuffer = this.gbuffer.normalBuffer
        let positionBuffer = this.gbuffer.positionBuffer
        for (var x = 0; x < colorBuffer.length; x++) {
          for (var y = 0; y < colorBuffer[0].length; y++) {
            // let int = Math.floor
            // x = int(x)
            // y = int(y)
            // 用座标算像素下标

            // alpha混合
            if(colorBuffer[x][y].r != undefined){

              let lightColor = this.calculateLightColor(colorBuffer[x][y], normalBuffer[x][y], positionBuffer[x][y])

              let i = (y * this.w + x) * this.bytesPerPixel
              // 设置像素
              let p = this.pixels.data
              // let c1 =  colorBuffer[x][y]
              let c1 =  lightColor
              // let c3 = c1
              let c2 = GuaColor.new(p[i], p[i+1], p[i+2], p[i+3])
              let c3 = c1.blend(c2)
              p[i] = c3.r
              p[i+1] = c3.g
              p[i+2] = c3.b
              p[i+3] = c3.a
            }

          }
        }
    }

    _setPixel(x, y, color) {
        // color: GuaColor
        // 浮点转 int
        // log(1)
        let int = Math.floor
        x = int(x)
        y = int(y)
        // 用座标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        // alpha混合
        let c1 = color
        let c2 = GuaColor.new(p[i], p[i+1], p[i+2], p[i+3])
        let c3 = c1.blend(c2)
        // let c3 = c1
        p[i] = c3.r
        p[i+1] = c3.g
        p[i+2] = c3.b
        p[i+3] = c3.a
        // let {r, g, b, a} = color
        // // 一个像素 4 字节, 分别表示 r g b a
        //
        // p[i] = r
        // p[i+1] = g
        // p[i+2] = b
        // p[i+3] = a
    }

    //

        drawPoint(point, color=GuaColor.white(), passName, worldTriangleNormal, worldTrianglePosition) {
            // point: GuaVector
            let {w, h} = this
            let p = point
            // log(passName)
            if (passName ==  'geometryPass') {
              // log(1)
              if (p.x >= 0 && p.x <= w) {
                  if (p.y >= 0 && p.y <= h) {
                      let x, y
                      x = int(p.x), y = int(p.y)
                      // // x = x-1
                      // let n = worldTriangleNormal
                      // let tn = GuaVector.center(n[0],n[1],n[2])

                      // let cn = GuaVector.new(5, 4, 10)
                      // let backFlag = cn.cos(worldTriangleNormal)
                      // // let backFlag = this.isBack(point, worldTriangleNormal)
                      // if (backFlag <= 0) {
                        if (this.zBuffer[x][y] == 0 || this.zBuffer[x][y] >= p.z) {
                            this.zBuffer[x][y] = p.z
                            this.gbuffer.colorBuffer[x][y] = color
                            this.gbuffer.normalBuffer[x][y] = worldTriangleNormal
                            this.gbuffer.positionBuffer[x][y] = p
                        }
                      // }
                      // if(worldTriangleNormal[0] == undefined){
                      //   log(worldTriangleNormal)
                      // }
                      // if(worldTrianglePosition[0] == undefined){
                      //   log(worldTrianglePosition)
                      // }
                      // if (this.zBuffer[x][y] == 0) {
                      //     this.zBuffer[x][y] = p.z
                      //     // log(color)
                      //     // log(x,y)
                      //     // log(this.colorBuffer.length)
                      //     // log(this.colorBuffer[x][y])
                      //
                      //     this.gbuffer.colorBuffer[x][y] = color
                      //     this.gbuffer.normalBuffer[x][y] = worldTriangleNormal
                      //     this.gbuffer.positionBuffer[x][y] = p
                      // } else {
                      //     if (this.zBuffer[x][y] >= p.z) {
                      //         this.zBuffer[x][y] = p.z
                      //         this.gbuffer.colorBuffer[x][y] = color
                      //         this.gbuffer.normalBuffer[x][y] = worldTriangleNormal
                      //         this.gbuffer.positionBuffer[x][y] = p
                      //
                      //     } else {
                      //     }
                      // }

                  }
              }
            }
            else {
                // log(1)
                      if (p.x >= 0 && p.x <= w) {
                          if (p.y >= 0 && p.y <= h) {
                              let x, y
                              x = int(p.x), y = int(p.y)
                                // log('xy', x, y)
                              // x = x-1
                              try {
                                  this.zBuffer[x][y]
                              } catch (e) {
                                  log('x', x)
                              } finally {

                              }
                              if (this.zBuffer[x][y] == 0) {
                                  this.zBuffer[x][y] = p.z
                                  // log(1)
                                  this._setPixel(x, y, color)
                              } else {
                                  if (this.zBuffer[x][y] >= p.z) {
                                      this.zBuffer[x][y] = p.z
                                      this._setPixel(x, y, color)
                                  } else {
                                  }
                              }

                          }
                      }
            }

        }
        drawScanline(v1, v2, cos, passName, worldTriangleNormal, worldTrianglePosition) {
            // log('v12',v1,v2)
            let {w, h} = this
            let [iw, ih] = [this.img.w, this.img.h]
            let minV, maxV
            let c, r, g, b, a, linColor, p, z, u, v
            // if (v1.isInCanvas(w, h) && v2.isInCanvas(w, h)) {
                if (v1.position.y == v2.position.y){
                    if (v1.position.x < v2.position.x) {
                        minV = v1
                        maxV = v2
                    } else {
                        minV = v2
                        maxV = v1
                    }
                    for (let x = minV.position.x; x < maxV.position.x; x++) {
                        c = (x-minV.position.x)/(maxV.position.x-minV.position.x)
                        // r = (maxV.color.r - minV.color.r)*c + minV.color.r
                        // g = (maxV.color.g - minV.color.g)*c + minV.color.g
                        // b = (maxV.color.b - minV.color.b)*c + minV.color.b
                        // a = (maxV.color.a - minV.color.a)*c + minV.color.a
                        u = (maxV.u - minV.u)*c + minV.u
                        v = (maxV.v - minV.v)*c + minV.v
                        // log('uv',u,v)
                        let uv = [u, v].map((e) => {
                            if (e >= 1) {
                               return 0.99
                            } else if (e < 0) {
                              // log('e0', e)
                                return 0
                            } else {
                               return e
                            }
                        })
                        linColor = this.img.imgBuffer[int(ih*uv[1])][int(iw*uv[0])]
                        //光照后
                        // log(linColor)
                        // linColor = GuaColor.white()
                        // log
                        if (cos > 1) {
                            cos = 1
                        } else if (cos < 0) {
                            cos = 0
                        }
                        // log(linColor.r, typeof(linColor.r))
                        // if (cos <= 1 && cos >= 0 ){
                        let factor = 0.5 + cos * 0.5
                        let r = Math.min(linColor.r * factor, 255)
                        let g = Math.min(linColor.g * factor, 255)
                        let b = Math.min(linColor.b * factor, 255)

                        let lightColor = GuaColor.new(r, g, b, linColor.a)
                        // log(linColor)

                        // console.assert(linColor.b > 0, "rgb = 0");
                        // console.assert(cos < 1, "1");

                        // linColor = this.img.imgBuffer[int(iw*uv[0])][int(ih*uv[1])]
                        //
                        // } catch (e) {
                        //   log('uv',)
                        // } finally {
                        //
                        // }
                        // linColor = GuaColor.new(r, g, b, a)
                        z = (maxV.position.z - minV.position.z)*c + minV.position.z
                        p = GuaVector.new(x, v1.position.y, z)
                        // this.drawPoint(p, lightColor)
                        this.drawPoint(p, linColor, passName, worldTriangleNormal, worldTrianglePosition)
                        // this.drawPoint(p, lightColor, passName, worldTriangleNormal, worldTrianglePosition)
                        // this.drawPoint(p, linColor, passName)
                        // this._setPixel(x, v1.position.y, linColor)
                        // break

                    }
                }
            // }
        }
        drawHalfTriangle(a, b, c, flag=1, cos, passName, worldTriangleNormal, worldTrianglePosition) {
          //flag判断是上半还是下半, 1是上半
            // log('color',a,b,c)
            let sx, ex, sc, ec
            let sr, sg, sb, sa, sz, su, sv
            let er, eg, eb, ea, ez, eu, ev
            let slinColor, elinColor
            let sn, en = [a.n, b.n]
            let upV, downV
            let [w, h] = [this.img.w, this.img.h]
            // log('wh',w,h)
            if (flag == 1) {
                upV = a, downV = b
            } else {
                upV = b, downV = c
            }
            for (let y = downV.position.y; y > upV.position.y; y--) {
                sx = ((a.position.x - c.position.x)*(y - c.position.y)/(a.position.y-c.position.y))
                +c.position.x
                ex = ((upV.position.x - downV.position.x)*(y - b.position.y)/(upV.position.y-downV.position.y))
                +b.position.x
                // // log('80/52',80/52)
                // log('y-c.position.y',y-c.position.y)
                sc = (y-c.position.y)/(a.position.y-c.position.y)
                ec = (y-b.position.y)/(upV.position.y-downV.position.y)

                // log('sc ec', sc,ec)
                // sr = (a.color.r - c.color.r)*sc + c.color.r
                // sg = (a.color.g - c.color.g)*sc + c.color.g
                // sb = (a.color.b - c.color.b)*sc + c.color.b
                // sa = (a.color.a - c.color.a)*sc + c.color.a
                su = (a.u - c.u)*sc + c.u
                sv = (a.v - c.v)*sc + c.v
                sz = (a.position.z - c.position.z)*sc + c.position.z
                // log('slinColor', sr, sg, sb, sa)
                // log('typeof',typeof(c.v))
                // er = (upV.color.r - downV.color.r)*ec + b.color.r
                // eg = (upV.color.g - downV.color.g)*ec + b.color.g
                // eb = (upV.color.b - downV.color.b)*ec + b.color.b
                // ea = (upV.color.a - downV.color.a)*ec + b.color.a
                eu = (upV.u - downV.u)*ec + b.u
                ev = (upV.v - downV.v)*ec + b.v
                // log('euv', int(h*ev), int(w*eu))

                // elinColor = this.img.imgBuffer[int(h*ev)][int(w*eu)]

                // elinColor = GuaColor.new(er, eg, eb, ea)
                ez = (upV.position.z - downV.position.z)*ec + b.position.z

                // log('slinColor', slinColor, elinColor)
                // log('su, sv', su, sv)
                let p1 = GuaVector.new(sx, y, sz)
                let p2 = GuaVector.new(ex, y, ez)
                let v1 = GuaVertex.new(p1, GuaColor.black, sn, su, sv)
                let v2 = GuaVertex.new(p2, GuaColor.black, en, eu, ev)

                // let v1 = GuaVertex.new(p1, GuaColor.white())
                // let v2 = GuaVertex.new(p2, GuaColor.white())
                this.drawScanline(v1, v2, cos, passName, worldTriangleNormal, worldTrianglePosition)
                // break
            }

        }

        drawTriangle(v1, v2, v3, cos, passName, worldTriangleNormal, worldTrianglePosition) {
            // log('v123',v1, v2, v3)
            let {w, h} = this
            let minV, maxV
            let [a, b, c] = [v1, v2, v3].sort(function(n, m) { //callback
                if (n.position.y > m.position.y) {
                  return 1  //返回正数 ，b排列在a之前
                } else {
                  return -1 //返回负数 ，a排列在b之前
                }
            })
            this.drawHalfTriangle(a, b, c, 1, cos, passName, worldTriangleNormal, worldTrianglePosition)
            this.drawHalfTriangle(a, b, c, 0, cos, passName, worldTriangleNormal, worldTrianglePosition)
        }


    geometryPass(mesh){
      this.draw3d(mesh, 'geometryPass')
        // this.gbuffer.draw3d(mesh)
        // this.setPixelFromColorBuffer(this.gbuffer.colorBuffer)
    }


    draw3d(mesh, passName) {
        // // camera
        let {w, h} = this
        let {position, target, up} = this.camera
        this.img = mesh.img
        const view = Matrix.lookAtLH(position, target, up)
        // field of view
        const projection = Matrix.perspectiveFovLH(0.8, w / h, 0.1, 1)

        // 得到 mesh 中点在世界中的坐标

        const rotation = Matrix.rotation(mesh.rotation)
        const translation = Matrix.translation(mesh.position)
        const world = rotation.multiply(translation)
        // let trans = view.multiply(projection)
        const transform = world.multiply(view).multiply(projection)

        let vertices = mesh.vertices
        let triangles = mesh.triangles

        // let l = GuaVertex.new(this.light, GuaColor.black(), this.light, 0, 0)
        // triangles = triangles.sort((a, b) => -(vertices[a[0]].position.z - vertices[b[0]].position.z))
        for (let t of triangles) {
            // log("ttt", t)
            // 拿到三角形的三个顶点
            let a = vertices[t[0]]
            let b = vertices[t[1]]
            let c = vertices[t[2]]
            //light
            // let [ap, bp, cp] = [a.position, b.position, c.position]
            // let worldTriangle = [ap, bp, cp].map(v => world.transform(v))
            let worldTrianglePosition = [a.position, b.position, c.position].map(v => world.transform(v))
            let worldTriangleNormal = [a.n, b.n, c.n].map(v => rotation.transform(v))
            // let [a2, b2, c2] = [a1, b1, c1].map(v => this.project(v, trans))
            // log('worldTriangle', worldTriangle)
            let n = worldTriangleNormal
            let tn = GuaVector.center(worldTriangleNormal[0], worldTriangleNormal[1], worldTriangleNormal[2])

            let cos = this.calculateWorldCos(this.light, worldTriangleNormal, worldTrianglePosition)

            let cn = GuaVector.new(5, 4, 10)
            // let cn = GuaVector.new(5, 5, 5)
            // log(this.camera.cn)
            let backFlag = this.isBack(cn, worldTriangleNormal)
            if (backFlag >= 0) {
                continue
            }
            // if (backFlag  > 0.3) {
            //     continue
            // }
            // 拿到屏幕上的 3 个像素点
            // log("abc", a, b, c)
            let [v1, v2, v3] = [a, b, c].map(v => this.project(v, transform))

            this.drawTriangle(v1, v2, v3, cos, passName, tn, worldTrianglePosition)
            // break
        }
    }

    isBack(cn, worldTriangleNormal) {
        //camera n
        let n = worldTriangleNormal
        let tn = GuaVector.center(n[0],n[1],n[2])
        let flag = cn.cos(tn)
        // log('cntn', cn, tn, flag)
        return flag
    }

    calculateWorldCos(light, worldTriangleNormal, worldTrianglePosition) {
      let p = worldTrianglePosition
      let n = worldTriangleNormal
      //三角形的中心点
      let triCen = GuaVector.center(p[0], p[1], p[2])
      //三角形的法向量
      let tn = GuaVector.center(n[0],n[1],n[2])
      //光线向量
      let ln = triCen.sub(light)

      let cos = ln.cos(tn)
      return cos
    }

    drawImg(img) {
        let w = img.w
        let h = img.h
        let p, c, v
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                p = GuaVector.new(x,y,1)
                c = img.imgBuffer[y][x]
                this.drawPoint(p, c)
            }

            // break
        }
    }

    drawLine(p1, p2, color=GuaColor.black()) {
        // log('drawLine', p1, p2)
        let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y]
        let dx = x2 - x1
        let dy = y2 - y1
        let R = (dx ** 2 + dy ** 2) ** 0.5
        let ratio = dx === 0 ? undefined : dy / dx
        let angle = 0
        if (ratio === undefined) {
            const p = Math.PI / 2
            angle = dy >= 0 ? p : -p
        } else {
            const t = Math.abs(dy / R)
            const sin = ratio >= 0 ? t : -t
            const asin = Math.asin(sin)
            angle = dx > 0 ? asin : asin + Math.PI
        }
        // log('R', R)
        for (let r = 0; r <= R; r++) {
            const x = x1 + Math.cos(angle) * r
            const y = y1 + Math.sin(angle) * r

            this.drawPoint(GuaVector.new(x, y, p1.z), color)
        }
    }
    __debug_draw_demo() {
        // 这是一个 demo 函数, 用来给你看看如何设置像素
        let {context, pixels} = this
        // 获取像素数据, data 是一个数组
        let data = pixels.data
        // 一个像素 4 字节, 分别表示 r g b a
        for (let i = 0; i < data.length; i += 4) {
            let [r, g, b, a] = data.slice(i, i + 4)
            r = 255
            a = 255
            data[i] = r
            data[i+3] = a
        }
        context.putImageData(pixels, 0, 0)
    }

    // drawPoint(point, color=GuaColor.black(), passName) {
    //     // point: GuaVector
    //     let {w, h} = this
    //     let p = point
    //     // log(passName)
    //     if (passName ==  'geometryPass') {
    //       // log(1)
    //       if (p.x >= 0 && p.x <= w) {
    //           if (p.y >= 0 && p.y <= h) {
    //               let x, y
    //               x = int(p.x), y = int(p.y)
    //                 // log('xy', x, y)
    //               // x = x-1
    //               try {
    //                   this.zBuffer[x][y]
    //               } catch (e) {
    //                   log('x', x)
    //               } finally {
    //
    //               }
    //               if (this.zBuffer[x][y] == 0) {
    //                   this.zBuffer[x][y] = p.z
    //                   // log(color)
    //                   // log(x,y)
    //                   // log(this.colorBuffer.length)
    //                   // log(this.colorBuffer[x][y])
    //                   this.gbuffer.colorBuffer[x][y] = color
    //               } else {
    //                   if (this.zBuffer[x][y] >= p.z) {
    //                       this.zBuffer[x][y] = p.z
    //                       this.gbuffer.colorBuffer[x][y] = color
    //                   } else {
    //                   }
    //               }
    //
    //           }
    //       }
    //     }
    //     else {
    //         log(1)
    //               if (p.x >= 0 && p.x <= w) {
    //                   if (p.y >= 0 && p.y <= h) {
    //                       let x, y
    //                       x = int(p.x), y = int(p.y)
    //                         // log('xy', x, y)
    //                       // x = x-1
    //                       try {
    //                           this.zBuffer[x][y]
    //                       } catch (e) {
    //                           log('x', x)
    //                       } finally {
    //
    //                       }
    //                       if (this.zBuffer[x][y] == 0) {
    //                           this.zBuffer[x][y] = p.z
    //                           // log(1)
    //                           this._setPixel(x, y, color)
    //                       } else {
    //                           if (this.zBuffer[x][y] >= p.z) {
    //                               this.zBuffer[x][y] = p.z
    //                               this._setPixel(x, y, color)
    //                           } else {
    //                           }
    //                       }
    //
    //                   }
    //               }
    //     }
    //
    // }
    // drawScanline(v1, v2, cos, passName) {
    //     // log('v12',v1,v2)
    //     let {w, h} = this
    //     let [iw, ih] = [this.img.w, this.img.h]
    //     let minV, maxV
    //     let c, r, g, b, a, linColor, p, z, u, v
    //     // if (v1.isInCanvas(w, h) && v2.isInCanvas(w, h)) {
    //         if (v1.position.y == v2.position.y){
    //             if (v1.position.x < v2.position.x) {
    //                 minV = v1
    //                 maxV = v2
    //             } else {
    //                 minV = v2
    //                 maxV = v1
    //             }
    //             for (let x = minV.position.x; x < maxV.position.x; x++) {
    //                 c = (x-minV.position.x)/(maxV.position.x-minV.position.x)
    //                 // r = (maxV.color.r - minV.color.r)*c + minV.color.r
    //                 // g = (maxV.color.g - minV.color.g)*c + minV.color.g
    //                 // b = (maxV.color.b - minV.color.b)*c + minV.color.b
    //                 // a = (maxV.color.a - minV.color.a)*c + minV.color.a
    //                 u = (maxV.u - minV.u)*c + minV.u
    //                 v = (maxV.v - minV.v)*c + minV.v
    //                 // log('uv',u,v)
    //                 let uv = [u, v].map((e) => {
    //                     if (e >= 1) {
    //                        return 0.99
    //                     } else if (e < 0) {
    //                       // log('e0', e)
    //                         return 0
    //                     } else {
    //                        return e
    //                     }
    //                 })
    //                 linColor = this.img.imgBuffer[int(ih*uv[1])][int(iw*uv[0])]
    //                 //光照后
    //                 // log(linColor)
    //                 // linColor = GuaColor.white()
    //
    //                 if (cos > 1) {
    //                     cos = 1
    //                 } else if (cos < 0) {
    //                     cos = 0
    //                 }
    //                 // log(linColor.r, typeof(linColor.r))
    //                 // if (cos <= 1 && cos >= 0 ){
    //                 let factor = 0.2 + cos * 0.8
    //                 let r = Math.min(linColor.r * factor, 255)
    //                 let g = Math.min(linColor.g * factor, 255)
    //                 let b = Math.min(linColor.b * factor, 255)
    //
    //                 let lightColor = GuaColor.new(r, g, b, linColor.a)
    //                 // log(linColor)
    //
    //                 // console.assert(linColor.b > 0, "rgb = 0");
    //                 // console.assert(cos < 1, "1");
    //
    //                 // linColor = this.img.imgBuffer[int(iw*uv[0])][int(ih*uv[1])]
    //                 //
    //                 // } catch (e) {
    //                 //   log('uv',)
    //                 // } finally {
    //                 //
    //                 // }
    //                 // linColor = GuaColor.new(r, g, b, a)
    //                 z = (maxV.position.z - minV.position.z)*c + minV.position.z
    //                 p = GuaVector.new(x, v1.position.y, z)
    //                 // this.drawPoint(p, lightColor)
    //                 this.drawPoint(p, linColor, passName)
    //                 // this._setPixel(x, v1.position.y, linColor)
    //                 // break
    //
    //             }
    //         }
    //     // }
    // }
    // drawHalfTriangle(a, b, c, flag=1, cos, passName) {
    //   //flag判断是上半还是下半, 1是上半
    //     // log('color',a,b,c)
    //     let sx, ex, sc, ec
    //     let sr, sg, sb, sa, sz, su, sv
    //     let er, eg, eb, ea, ez, eu, ev
    //     let slinColor, elinColor
    //     let sn, en = [a.n, b.n]
    //     let upV, downV
    //     let [w, h] = [this.img.w, this.img.h]
    //     // log('wh',w,h)
    //     if (flag == 1) {
    //         upV = a, downV = b
    //     } else {
    //         upV = b, downV = c
    //     }
    //     for (let y = downV.position.y; y > upV.position.y; y--) {
    //         sx = ((a.position.x - c.position.x)*(y - c.position.y)/(a.position.y-c.position.y))
    //         +c.position.x
    //         ex = ((upV.position.x - downV.position.x)*(y - b.position.y)/(upV.position.y-downV.position.y))
    //         +b.position.x
    //
    //         // // log('80/52',80/52)
    //         // log('y-c.position.y',y-c.position.y)
    //         sc = (y-c.position.y)/(a.position.y-c.position.y)
    //         ec = (y-b.position.y)/(upV.position.y-downV.position.y)
    //
    //         // log('sc ec', sc,ec)
    //         // sr = (a.color.r - c.color.r)*sc + c.color.r
    //         // sg = (a.color.g - c.color.g)*sc + c.color.g
    //         // sb = (a.color.b - c.color.b)*sc + c.color.b
    //         // sa = (a.color.a - c.color.a)*sc + c.color.a
    //         su = (a.u - c.u)*sc + c.u
    //         sv = (a.v - c.v)*sc + c.v
    //         sz = (a.position.z - c.position.z)*sc + c.position.z
    //         // log('slinColor', sr, sg, sb, sa)
    //         // log('typeof',typeof(c.v))
    //         // er = (upV.color.r - downV.color.r)*ec + b.color.r
    //         // eg = (upV.color.g - downV.color.g)*ec + b.color.g
    //         // eb = (upV.color.b - downV.color.b)*ec + b.color.b
    //         // ea = (upV.color.a - downV.color.a)*ec + b.color.a
    //         eu = (upV.u - downV.u)*ec + b.u
    //         ev = (upV.v - downV.v)*ec + b.v
    //         // log('euv', int(h*ev), int(w*eu))
    //
    //         // elinColor = this.img.imgBuffer[int(h*ev)][int(w*eu)]
    //
    //         // elinColor = GuaColor.new(er, eg, eb, ea)
    //         ez = (upV.position.z - downV.position.z)*ec + b.position.z
    //
    //         // log('slinColor', slinColor, elinColor)
    //         // log('su, sv', su, sv)
    //         let p1 = GuaVector.new(sx, y, sz)
    //         let p2 = GuaVector.new(ex, y, ez)
    //         let v1 = GuaVertex.new(p1, GuaColor.black, sn, su, sv)
    //         let v2 = GuaVertex.new(p2, GuaColor.black, en, eu, ev)
    //
    //         // let v1 = GuaVertex.new(p1, GuaColor.white())
    //         // let v2 = GuaVertex.new(p2, GuaColor.white())
    //         this.drawScanline(v1, v2, cos, passName)
    //         // break
    //     }
    //
    // }
    //
    // drawTriangle(v1, v2, v3, cos, passName) {
    //     // log('v123',v1, v2, v3)
    //     let {w, h} = this
    //     let minV, maxV
    //     let [a, b, c] = [v1, v2, v3].sort(function(n, m) { //callback
    //         if (n.position.y > m.position.y) {
    //           return 1  //返回正数 ，b排列在a之前
    //         } else {
    //           return -1 //返回负数 ，a排列在b之前
    //         }
    //     })
    //     this.drawHalfTriangle(a, b, c, 1, cos, passName)
    //     this.drawHalfTriangle(a, b, c, 0, cos, passName)
    // }
}
