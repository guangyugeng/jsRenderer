class GuaVector extends GuaObject {
    // 表示二维向量的类
    constructor(x, y, z) {
        super()
        this.x = x
        this.y = y
        this.z = z
    }

    static center(a, b, c) {
        let x = (a.x + b.x + c.x)/3
        let y = (a.y + b.y + c.y)/3
        let z = (a.z + b.z + c.z)/3
        return GuaVector.new(x, y, z)
    }
    interpolate(other, factor) {
        let p1 = this
        let p2 = other
        let x = p1.x + (p2.x - p1.x) * factor
        let y = p1.y + (p2.y - p1.y) * factor
        return GuaVector.new(x, y)
    }
    cos(other) {
        // let mu = p1.x * p2.x + p1.y * p2.y + p1.z * p2.z
        let n1 = this.normalize()
        let n2 = other.normalize()
        let dotv = n1.dot(n2)
        // let zi1 = (this.x ** 2 + this.y ** 2 + this.z ** 2) ** 0.5
        // let zi2 = (other.x ** 2 + other.y ** 2 + other.z ** 2) ** 0.5
        // log('cos', n1, n2, dotv)
        return dotv
    }
    toString() {
        let s = ''
        s += this.x.toFixed(3)
        s += this.y.toFixed(3)
        s += this.z.toFixed(3)
        return s
    }
    multi_num(n) {
        return GuaVector.new(this.x * n, this.y * n, this.z * n)
    }
    sub(v) {
        let x = this.x - v.x
        let y = this.y - v.y
        let z = this.z - v.z
        return GuaVector.new(x, y, z)
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    normalize() {
        let l = this.length()
        if (l == 0) {
            return this
        }
        let factor = 1 / l

        return this.multi_num(factor)
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }
    cross(v) {
        let x = this.y * v.z - this.z * v.y
        let y = this.z * v.x - this.x * v.z
        let z = this.x * v.y - this.y * v.x
        return GuaVector.new(x, y, z)
    }
}
