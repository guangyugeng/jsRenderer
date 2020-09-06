class GuaImg extends GuaObject {
    // 表示二维向量的类
    constructor(w, h) {
        super()
        this.w = w
        this.h = h
        this.imgBuffer = []
    }

    static fromGuaImg(axeImgString) {
        // log(axe3dString)
        let m = this.new()
        let axeImgLL = axeImgString.split('\n')
        let w = Math.floor(axeImgString.split('\n')[3])
        let h = Math.floor(axeImgString.split('\n')[4])
        log('Img',w, h)
        m.w = w, m.h = h
        let p, c, v, axeImgL, r, g, b, a
        for (var i = 0; i < h; i++) {
            m.imgBuffer.push([])
            axeImgL = axeImgLL[i+5].split('#')
            // log(axeImgL)
            // break
            for (var j = 0; j < w; j++){
                [r, g, b, a] = axeImgL[j].split(' ').map((e) => {
                    return parseFloat(e)
                })
                // p = GuaVector.new(j, i, 1)

                c = GuaColor.new(r, g, b, a)
                // v = GuaVertex.new(p, c)
                m.imgBuffer[i].push(c)
            }
        }

        return m
    }
}
