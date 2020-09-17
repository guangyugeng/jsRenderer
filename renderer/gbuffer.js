class GuaGBuffer extends GuaObject {
    constructor(w, h) {
        super()
        this.w = w
        this.h = h
        // this.specularBuffer = this.initBuffer(w, h)
        this.normalBuffer = this.initBuffer(w, h, 'normal')
        this.positionBuffer = this.initBuffer(w, h, 'position')
        this.colorBuffer = this.initBuffer(w, h, 'color')
        this.zBuffer = this.initBuffer(w, h,'z')
    }

    initBuffer(w, h, type){
      var buffer = []
      for (let i = 0; i < this.w; i++) {
          let a = []
          for (let j = 0; j < this.h; j++) {
            switch(type) {
                 case 'z':
                    a.push(0)
                    break
                 case 'color':
                    a.push(GuaColor.new())
                    break
                 case 'normal':
                    a.push(GuaNormal.new())
                    break
                 case 'position':
                    a.push(GuaVector.new())
                    break
                 default:
                    // 默认代码块
              }
          }
          buffer.push(a)
      }
      return buffer
    }


    clear(color=GuaColor.white(), normal=GuaNormal.new(), position=GuaVector.new()){
      for (let x = 0; x < this.w; x++) {
          for (let y = 0; y < this.h; y++) {
              this.colorBuffer[x][y] = color
              // log(color)
              this.normalBuffer[x][y] = normal
              this.positionBuffer[x][y] = position
              // x = Math.round(x), y = Math.round(y)
              // log('xy ', x,y)
              try{
                  this.zBuffer[x][y] = 0
              }catch(error){
                  log('xy ', x,y)
              }
          }
      }
      // this.colorBuffer
    }

}
