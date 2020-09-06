class GuaColor extends GuaObject {
    // 表示颜色的类
    constructor(r, g, b, a) {
        super()
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    // 常见的几个颜色
    static black() {
        return this.new(0, 0, 0, 255)
    }
    static white() {
        return this.new(255, 255, 255, 255)
    }
    static red() {
        return this.new(255, 0, 0, 255)
    }
    static green() {
        return this.new(0, 255, 0, 255)
    }
    static blue() {
        return this.new(0, 0, 255, 255)
    }
    static random() {
        let c1, c2, c3
        c1 = Math.floor(Math.random()*255)
        c2 = Math.floor(Math.random()*255)
        c3 = Math.floor(Math.random()*255)
        return this.new(c1, c2, c3, 255)
    }
    blend(other) {
        let src = this
        let dest = other

        let a1 = src.a / 255
        let a2 = dest.a / 255
        let alpha = 1 - (1 - a1) * (1 - a2)
        let r = Math.floor((1 - alpha) * dest.r + alpha * src.r)
        let g = Math.floor((1 - alpha) * dest.g + alpha * src.g)
        let b = Math.floor((1 - alpha) * dest.b + alpha * src.b)
        let a = Math.floor((a1 + a2 *(1-a1)) * 255)

        let c = GuaColor.new(r, g, b, a)
        return c
    }
}
