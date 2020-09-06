class GuaVertex extends GuaObject {
    // 表示顶点的类, 包含 GuaVector 和 GuaColor
    // 表示了一个坐标和一个颜色
    constructor(position, color, n, u, v) {
        super()
        this.position = position
        this.color = color
        this.n = n
        this.u = u
        this.v = v
    }
    interpolate(other, factor) {
    let a = this
    let b = other
    let p = a.position.interpolate(b.position, factor)
    let c = a.color.interpolate(b.color, factor)
    return GuaVertex.new(p, c)
    }
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
