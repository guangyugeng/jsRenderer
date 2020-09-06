// 定位跳转索引
const go_top = function() {
    
    loadWeights()
    
    loadFrames()
    
    calUpdateFrame()
    
    html()
}


// 1. 读取每个顶点受骨骼影响系数的二维数组

// weightString : vertices_skeletons_weights.js中保存的字符串
const loadWeights = function(weightString) {
    let tmp = weightString.trim().split('\n')
    let fix = tmp[0]
    let version = tmp[1]
    let skeleton_nums = parseInt(tmp[2].split(" ")[1])
    let vertice_nums = parseInt(tmp[3].split(" ")[1])
    /* 
        创建二维数组 Weight_list[vertice_nums][skeleton_nums]
        vertice_nums 顶点数 
        skeleton_nums 骨骼数
        这个的话会有重复的数据，但是为了方便直接给模型更新顶点，没有去重处理
        
        例子：Weight_list[0][3] 就表示第0个顶点，受第3个骨骼影响的系数 
    */

    // 创建二维数组
    let weight_list = new Array();              
    for(let x = 0; x < vertice_nums; x++){
        weight_list[x]=new Array();        
        for(let y = 0; y < skeleton_nums; y++){
            weight_list[x][y] = 0;        
        }
    }
    
    // 按行遍历， 当前为第{vertice_index}个顶点的
    let vertice_index = 0
    for (let index = 4; index < 4 + vertice_nums; index++) {
        const line = tmp[index]
        
        // 2 3 4 0#0.0324412483524 0.902284582307 0.0652741693409 0
        let line_split = line.trim().split('#')
        // 2 3 4 0
        let skeletons = line_split[0].trim().split(' ')
        // 0.0324412483524 0.902284582307 0.0652741693409 0
        let weights = line_split[1].trim().split(' ')

        for (let i = 0; i < skeletons.length; i++) {
            const skeleton = parseInt(skeletons[i])
            const weight = parseFloat(weights[i])

            if (weight != 0) {
                // 当前为第{vertice_index}个顶点的
                weight_list[vertice_index][skeleton] = weight
            }
        }
        vertice_index += 1
    }
    return weight_list
}

go_top()


// 2. 读取每个动画片段的骨骼变换矩阵

// frameString : animation_frames 中保存的字符串
const loadFrames = function(frameString) {
    let tmp = frameString.trim().split('\n')
    let fix = tmp[0]
    let version = tmp[1]
    let skeleton_nums = parseInt(tmp[2].split(" ")[1])
    let frame_nums = parseInt(tmp[3].split(" ")[1])
    /*
        创建动画帧数组
        frame_list[frame_nums]
        frame_nums 就是动画有几帧

    */
    frame_list = []
    for (let index = 4; index < 4 + frame_nums; index++) {
        const line = tmp[index] 
        let line_split = line.trim().split('#')
        
        tmp_list = []
        // 每一帧都有 {skeleton_nums} 个骨骼的变换矩阵
        for (let i = 0; i < skeleton_nums; i++) {
            const element = line_split[i]
            matrix_list = element.trim().split(' ')
            /*
                每一个骨骼变换矩阵示例，应该是4x4为什么只有3x4呢？
                因为完整的骨骼变换矩阵是这样的
                r11-r33记录了旋转与缩放信息
                tx、ty、tz记录了位移信息
                我们只需要这三个信息，所以说只需要前三列的数据
                [
                    r11, r12, r13, 0,
                    r21, r22, r23, 0,
                    r31, r32, r33, 0,
                    tx,  ty,  tz,  1, 
                ]
                同时为了方便计算，保存成这样的形式:
                [
                    r11, r21, r31, tx,
                    r12, r22, r23, ty,
                    r13, r23, r33, tz
                ]
                样例数据:
                [
                    1.00000016469 -1.05775572939e-06 -3.29378513861e-07 3.58839691137 
                    1.05775542997e-06 0.999999881446 -3.29678707663e-13 -1.49260427405 
                    3.29378557468e-07 -1.87232370061e-14 1.00000028324 -0.398106189088
                ]

            */
            l = []
            matrix_list.forEach(element => {
                l.push(parseFloat(element))
            })
            tmp_list.push(l)
        }

        /*
            最终保存的就是
            [
                // frame1
                [
                    [骨骼1变换矩阵], [骨骼2变换矩阵], ... ,
                ],
                
                // frame2
                [
                    [骨骼1变换矩阵], [骨骼2变换矩阵], ... ,
                ],
                
                ...,
            ]
        */
        frame_list.push(tmp_list)
    }
    return frame_list
}

go_top()


// 3. 计算每一帧更新的顶点数组
/*
    index : 当前是第几个动画片段
    vertices : 原始顶点数组
    frame_list : loadFrames的结果
    weight_list : loadWeights的结果
    trans : vertices_and_trans.js 中保存的trans数组，是一个矩阵
*/
const calUpdateFrame = function(index, vertices, frame_list, weight_list, trans) {    
    // 计算每一个动画片段
    // while(index < frame_list.length) {
    let update_fame = []
    // 当前动画帧
    let cur_frame = frame_list[index]
    // 每个动画片段有固定的骨骼数
    let len = cur_frame.length
    
    // i 为从0开始依次遍历顶点进行更新
    for (let i = 0; i < vertices.length; i++) {
        let t = vertices[i]
        // 用于保存更新后的 [x, y, z] 结果
        let sum = [0, 0, 0]
        
        // j 为当前动画片段第几个骨骼
        for (let j = 0; j < len; j++) {
            // 对该顶点没有影响的骨骼跳过
            if (weight_list[i][j] == 0) {
                continue
            }

            // 每一个骨骼的变换矩阵
            let matrix = cur_frame[j]
            // 影响该顶点骨骼的影响系数
            let weight = weight_list[i][j]

            // 先乘 trans变换矩阵 再乘 骨骼变换矩阵
            let xhat = t[0] * trans[0] + t[1] * trans[1] + t[2] * trans[2] + trans[3]
            let yhat = t[0] * trans[4] + t[1] * trans[5] + t[2] * trans[6] + trans[7]
            let zhat = t[0] * trans[8] + t[1] * trans[9] + t[2] * trans[10] + trans[11]

            let x = xhat * matrix[0] + yhat * matrix[1] + zhat * matrix[2] + matrix[3]
            let y = xhat * matrix[4] + yhat * matrix[5] + zhat * matrix[6] + matrix[7]
            let z = xhat * matrix[8] + yhat * matrix[9] + zhat * matrix[10] + matrix[11]
            
            // 乘该骨骼对顶点的影响权重
            sum[0] += x * weight
            sum[1] += y * weight
            sum[2] += z * weight
        }

        // 对每个顶点，计算所有骨骼对其影响，得到最终顶点的位置，存入tmp_l数组中
        update_fame.push(sum)
    }
    return update_fame
}

go_top()

// 4. index.html里可以复制的
const html = function() {

    `
        <script src='source/animation_frames.js'></script>
        <script src='source/shou_axe3d.js'></script>
        <script src='source/shou_axeimage.js'></script>
        <script src='source/vertices_and_transform.js'></script>
        <script src='source/vertices_skeletons_weights.js'></script>


        let frame_list = loadFrames(animation_frames)
        let weight_list = loadWeights(vertices_skeletons_weights)
        let index = 0


        update_frame = calUpdateFrame(index, vertices, frame_list, weight_list, trans)
        axemesh1.update(update_frame)
        if (index < frame_list.length - 1) {
            index += 1
        } else {
            index = 0
        }
    `
}

go_top()
