作业 16


作业截止时间
周四


作业简要说明：
本作业的讨论频道为 #cg1
请注意，JS 代码的最外层只能有函数、类的定义，这一要求与 Python 一样


电脑屏幕显示的内容都是存在显存中的
显存相当于一个大数组, 操作系统通过设置显存来让屏幕显示不同的内容

现在的电脑都是 32 位色, 也就是说一个像素 4 个字节分别表示 rgba
所以我们可以把 HTML5 Canvas 的 data 当作显存来看待(原理是一模一样的, 相当于 canvas 是屏幕)

这一套功能用任何语言都能实现, 选择 js 的理由是环境方便开发轻松, 可以让我们专心抓主要矛盾
所以虽然是在用高级的语言, 但是做的是底层的原理方面的事

在现有的代码的基础上，实现下面描述的功能



交作业方式：
本次作业使用 JavaScript 完成
在作业压缩包代码的基础上，新增和需要修改的作业文件路径如下

axe16/index.html
axe16/renderer/canvas.js
axe16/renderer/vertex.js	GuaVertex 类
axe16/renderer/utils.js		放我们需要的辅助函数


1, 增加 GuaVertex 类，下面是定义
class GuaVertex extends GuaObject {
    // 表示顶点的类, 包含 GuaVector 和 GuaColor
    // 表示了一个坐标和一个颜色
    constructor(position, color) {
        super()
        this.position = position
        this.color = color
    }
}


2, 增加 GuaCanvas.drawScanline(v1, v2) 方法
v1 v2 是 position.y 相等的 2 个 GuaVertex


3, 增加 GuaCanvas.drawTriangle(v1, v2, v3) 方法
v1 v2 v3 都是 GuaVertex
作为三角形的 3 个顶点

参考下面的链接来完成作业, 注意, 颜色也要插值
https://zhuanlan.zhihu.com/p/20148016