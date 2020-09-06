class Axemesh extends GuaObject{
    // 表示顶点的类, 包含 GuaVector 和 GuaColor
    // 表示了一个坐标和一个颜色
    constructor() {
        super()
        // 坐标
        this.position = GuaVector.new(0, 0, 0)
        // 旋转角度
        this.rotation = GuaVector.new(0, 0, 0)

        this.scale = GuaVector.new(1, 1, 1)
        this.vertices = []
        this.indices = null
        this.triangles = []
        this.img = null

    }
    verticesFromVerL(verL, len) {
        let vertices = []
        let x, y, z, nx, ny, nz, u, v
        let n, p, vertex
        for (var i = 0; i < len; i++) {
            [x, y, z, nx, ny, nz, u, v] = verL[i].split(' ').map((e) => {
                return parseFloat(e)
            })
            n = GuaNormal.new(nx, ny, nz)
            p = GuaVector.new(x, y, z)
            vertex = GuaVertex.new(p, GuaColor.black(), n, u, v)
            vertices.push(vertex)
            // log('x, y, z, nx, ny, nz, u, v',x, y, z, nx, ny, nz, u, v)
            // break
        }
        return vertices
        // for (var i = 3; i < 3+len; i++) {
        //     // log(axe3dL[i])
        //     let p1, p2, p3, c1, c2, c3, v1, v2, v3
        //     let nums = axe3dL[i].split(/[# ]/).map((e) => {
        //         return parseFloat(e)
        //     })
        //     // log(nums)
        //     p1 = GuaVector.new(nums[0], nums[1], nums[2])
        //     p2 = GuaVector.new(nums[5], nums[6], nums[7])
        //     p3 = GuaVector.new(nums[10], nums[11], nums[12])
        //
        //     let imgNums = [nums[3], nums[4], nums[8], nums[9], nums[13], nums[14]].map((e) => {
        //         if (e >= 1) {
        //            return 0.99
        //         } else if (e < 0) {
        //           // log('e0', e)
        //             return 0
        //         } else {
        //            return e
        //         }
        //     })
        //
        //     v1 = GuaVertex.new(p1, GuaColor.blue(), imgNums[0], imgNums[1])
        //     v2 = GuaVertex.new(p2, GuaColor.blue(), imgNums[2], imgNums[3])
        //     v3 = GuaVertex.new(p3, GuaColor.blue(), imgNums[4], imgNums[5])
        //
        //     let triangle = [v1, v2, v3]
        //     m.triangles.push(triangle)
        //     // }
        // }
        // log('verticesFromString')
        // // let verL = verStr.split('\n')
        // log(verL[0])
        // return
    }
    trianglesFromVriL(triL, len) {
        let triangle
        let triangles = []
        for (var i = 0; i < len; i++) {
            triangle = triL[i].split(' ').map((e) => {
                return parseFloat(e)
            })
            triangles.push(triangle)
        }
        // log('trianglesFromString')
        // // let triL = triStr.split('\n')
        // log(triL[0])
        return triangles
    }
    static fromAxe3D(axe3dString, img) {
        // log(axe3dString.split('\n')[2].split(' '))
        let m = this.new()

        // var triangles = []
        let axe3dL = axe3dString.split('\n')
        let len = Math.floor(axe3dString.split('\n')[3].split(' ')[1])
        // log(len)
        for (var i = 4; i < 3+len; i++) {
            // log(axe3dL[i])
            let p1, p2, p3, c1, c2, c3, v1, v2, v3
            let nums = axe3dL[i].split(/[# ]/).map((e) => {
                return parseFloat(e)
            })
            // log(nums)
            p1 = GuaVector.new(nums[0], nums[1], nums[2])
            p2 = GuaVector.new(nums[5], nums[6], nums[7])
            p3 = GuaVector.new(nums[10], nums[11], nums[12])

            let imgNums = [nums[3], nums[4], nums[8], nums[9], nums[13], nums[14]].map((e) => {
                if (e >= 1) {
                   return 0.99
                } else if (e < 0) {
                  // log('e0', e)
                    return 0
                } else {
                   return e
                }
            })
            // let uL = [int(w*imgNums[0]), int(w*imgNums[2]), int(w*imgNums[4])]
            // let vL = [int(h*imgNums[1]), int(h*imgNums[3]), int(h*imgNums[5])]
            // c1 = img.imgBuffer[vL[0]][uL[0]]
            // c2 = img.imgBuffer[vL[1]][uL[1]]
            // c3 = img.imgBuffer[vL[2]][uL[2]]

            // v1 = GuaVertex.new(p1, c1, uL[0], vL[0])
            // v2 = GuaVertex.new(p2, c2, uL[1], vL[1])
            // v3 = GuaVertex.new(p3, c3, uL[2], vL[2])
            let cn = GuaVector.new(5, 4, 10)
            v1 = GuaVertex.new(p1, GuaColor.blue(), cn, imgNums[0], imgNums[1])
            v2 = GuaVertex.new(p2, GuaColor.blue(), cn, imgNums[2], imgNums[3])
            v3 = GuaVertex.new(p3, GuaColor.blue(), cn, imgNums[4], imgNums[5])
            // v1 = GuaVertex.new(p1, GuaColor.green())
            // v2 = GuaVertex.new(p2, GuaColor.red())
            // v3 = GuaVertex.new(p3, GuaColor.blue())
            // break
            // v3 = GuaVertex.new(p3, GuaColor.random())
            // log(v1, v2, v3)
            // break
            let triangle = [v1, v2, v3]
            m.triangles.push(triangle)
            // }
        }
        m.img = img
        return m

    }
    update(vertices) {
    let self = this
    let len = self.triangles.length
    let index = 0
    for (let i = 0; i < len; i++) {
        self.triangles[i][0].update_xyz(vertices[index])
        self.triangles[i][1].update_xyz(vertices[index + 1])
        self.triangles[i][2].update_xyz(vertices[index + 2])
        index += 3
    }
}
    // static fromAxe3D(axe3dString, img) {
    //     // log(axe3dString.split('\n')[2].split(' '))
    //     let m = this.new()
    //
    //     // var triangles = []
    //     let axe3dL = axe3dString.split('\n')
    //     let verLen = Math.floor(axe3dString.split('\n')[2].split(' ')[1])
    //     let triLen = Math.floor(axe3dString.split('\n')[3].split(' ')[1])
    //     log(verLen, triLen)
    //     m.vertices = m.verticesFromVerL(axe3dString.split('\n').slice(4,4+verLen), verLen)
    //     m.triangles = m.trianglesFromVriL(axe3dString.split('\n').slice(4+verLen), triLen)
    //
    //     m.img = img
    //     return m
    //
    // }
    // static fromAxe3D(axe3dString) {
    //     // log(axe3dString)
    //     let m = this.new()
    //
    //     // var triangles = []
    //     let axe3dL = axe3dString.split('\n')
    //     let len = Math.floor(axe3dString.split('\n')[2].split(' ')[1])
    //     // let int = Math.floor
    //     // x = int(x)
    //     // log(len)
    //     let colordict = {}
    //
    //     for (var i = 3; i < 3+len; i++) {
    //         // log(axe3dL[i])
    //         let p1, p2, p3, v1, v2, v3
    //         let nums = axe3dL[i].split(/[# ]/).map((e) => {
    //             return parseFloat(e)
    //         })
    //         // log(nums)
    //         p1 = GuaVector.new(nums[0], nums[1], nums[2])
    //         p2 = GuaVector.new(nums[3], nums[4], nums[5])
    //         p3 = GuaVector.new(nums[6], nums[7], nums[8])
    //
    //         let key1, key2, key3, randC
    //         // key1 = toString(Math.round(nums[0])) + toString(Math.round(nums[1])) + toString(Math.round(nums[2]))
    //         // log('Math.round(nums[0])',Math.round(nums[0]))
    //         // int num.toFixed(2)
    //         key1 = nums[0].toFixed(2).toString() + nums[1].toFixed(2).toString() + nums[2].toFixed(2).toString()
    //         key2 = nums[3].toFixed(2).toString() + nums[4].toFixed(2).toString() + nums[5].toFixed(2).toString()
    //         key3 = nums[6].toFixed(2).toString() + nums[7].toFixed(2).toString() + nums[8].toFixed(2).toString()
    //
    //         if (colordict[key1] == null) {
    //             randC = GuaColor.random()
    //             v1 = GuaVertex.new(p1, randC)
    //             colordict[key1] = randC
    //         } else {
    //             // log('you dian', key1)
    //             v1 = GuaVertex.new(p1, colordict[key1])
    //         }
    //
    //         if (colordict[key2] == null) {
    //             randC = GuaColor.random()
    //             v2 = GuaVertex.new(p2, randC)
    //             colordict[key2] = randC
    //         } else {
    //             // log('you dian', key2)
    //             v2 = GuaVertex.new(p2, colordict[key2])
    //         }
    //
    //         if (colordict[key3] == null) {
    //             randC = GuaColor.random()
    //             v3 = GuaVertex.new(p3, randC)
    //             colordict[key3] = randC
    //         } else {
    //             // log('you dian', key3)
    //             v3 = GuaVertex.new(p3, colordict[key3])
    //         }
    //         // log(colordict)
    //         // v2 = GuaVertex.new(p2, GuaColor.random())
    //         // v3 = GuaVertex.new(p3, GuaColor.random())
    //         let triangle = [v1, v2, v3]
    //         m.triangles.push(triangle)
    //         // }
    //     }
    //     return m
    //
    // }
    isInCanvas(w, h) {
        if (this.position.x >= 0 && this.position.x <= w) {
            if (this.position.y >= 0 && this.position.y <= h) {
                // log(1)
                return true
            } else {
                return false
            }
        } else {
            return false
        }

    }
}
