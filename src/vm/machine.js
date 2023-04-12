/**
 * @description 一个简单的虚拟机
 * 有15个寄存器分别编号0-14
 * 支持LD,ADD,MUL,DIV,SUB操作
 * LD有两个操作数，其余均为三个操作数
 * 只支持寄存器直接寻址和立即数寻址
 * 指令格式
 * OP DST SRC1 (SRC2)
 * 其中DST一定为寄存器，SRC为寄存器或立即数
 * 
 * 
 * 运算器：
 * 一个整数单元，用于LD
 * 一个加法运算单元，用于ADD，SUB
 * 一个乘法运算单元，用于MUL
 * 一个除法运算单元，用于DIV
 * 
 * 其中
 * LD需要1个周期
 * ADD需要2周期
 * MUL需要10个周期
 * DIV需要40个周期
 * @author tannal
 * 
 */


let test1 = `
LD R1 2
LD R2 3
ADD R3 R1 R2
MUL R4 R1 R3
DIV R5 R1 R2
`


// 寄存器编号从0-14
let R = new Array(15).fill(0)

let test2 = `
LD R6 R2
LD R2 R3
MUL R0 R2 R4
SUB R8 R6 R2
DIV R10 R0 R6
ADD R6 R8 R2
`
R[2] = 2
R[3] = 3

// 指令队列
export let instructions = []
// 指令状态
// 0 初始
// 1 流出
// 2 解码
// 3 执行
// 4 写回
export let istates = new Array(10).fill(0)

export let istatesfinished = new Array(10).fill(0)

// 运算器状态
// 0 整数单元
// 1 加法和减法单元
// 2 乘法单元
// 3 除法单元
export let functionUnitStates = []

// 下一个将要issue的指令
let next = 0;


// 一些未来周期的修改istatesfinished的任务
let iStatePendingJob = []

export function fetch(code) {
    const line = code.split('\n').filter(s => s.length !== 0)
    // const line = test2.split('\n').filter(s => s.length !== 0)
    instructions = line
    // console.log(instructions);
    // console.log(is);
}


export function issue() {

    if (istates.filter(v => v === 4).length === instructions.length) {
        console.log(istates);
        console.log(R);
        throw Error("程序结束")
    }
    const i = instructions[next]
    if (i === undefined) {
        return
    }
    let [op, dst, src1, src2] = i.split(' ')

    switch (op) {
        //整数单元
        case 'LD':
            if (typeof functionUnitStates[0] === 'object' && functionUnitStates[0].busy) {
                return
            }
            functionUnitStates[0] = {
                busy: true,
                op: 'LD',
                src1: src1,
                // dst一定是寄存器，我们直接记录号码0-14
                dst: +dst[1],
            }
            break;
        //乘法单元
        case 'MUL':
            if (typeof functionUnitStates[2] === 'object' && functionUnitStates[2].busy) {
                return
            }
            functionUnitStates[2] = {
                busy: true,
                op: 'MUL',
                src1: src1,
                src2: src2,
                // dst一定是寄存器，我们直接记录号码0-14
                dst: +dst[1],
            }
            break;
        //加法单元
        case 'ADD':
            if (typeof functionUnitStates[1] === 'object' && functionUnitStates[1].busy) {
                return
            }
            functionUnitStates[1] = {
                busy: true,
                op: 'ADD',
                src1: src1,
                src2: src2,
                // dst一定是寄存器，我们直接记录号码0-14
                dst: +dst[1],
            }
            break;
        //减法单元
        case 'SUB':
            if (typeof functionUnitStates[1] === 'object' && functionUnitStates[1].busy) {
                return
            }
            functionUnitStates[1] = {
                busy: true,
                op: 'SUB',
                src1: src1,
                src2: src2,
                // dst一定是寄存器，我们直接记录号码0-14
                dst: +dst[1],
            }
            break;
        //除法单元
        case 'DIV':
            if (typeof functionUnitStates[3] === 'object' && functionUnitStates[3].busy) {
                return
            }
            functionUnitStates[3] = {
                busy: true,
                op: 'DIV',
                src1: src1,
                src2: src2,
                // dst一定是寄存器，我们直接记录号码0-14
                dst: +dst[1],
            }
            break;

        default:
            break;
    }
    istates[next] = 1
    iStatePendingJob.push({
        iindex: next,
        remain: 1,
        istate: 1,
    })
    next++
}
// 执行时间
export let time = new Map;
time.set('LD', 1)
time.set('ADD', 2)
time.set('MUL', 10)
time.set('DIV', 40)
time.set('SUB', 2)
export function decode() {
    // 找到所有可以进行decode的指令
    // console.log("decode" , istates);
    const set = istatesfinished.map((v, i) => {
        if (v === 1) {
            return i
        }
        return -1
    }).filter(v => v >= 0)
    set.forEach((j) => {
        const readR = []

        istatesfinished.map((v, i) => {
            if (v < 4 && i < j) {
                return i
            }
            return -1
        }).filter(v => v >= 0).forEach(i => {
            const [op, dst, src1, src2] = instructions[i].split(' ')
            readR.push(dst)
        })

        let [op, dst, src1, src2] = instructions[j].split(' ')
        if (readR.includes(src1) || readR.includes(src2)) {
            return
        }
        // 下一个状态
        istates[j] = 2
        iStatePendingJob.push({
            iindex: j,
            remain: 1,
            istate: 2,
        })
    })
}


export function execute() {
    // console.log("execute", istates);
    // 找到所有正在执行的指令
    const set = istatesfinished.map((v, i) => {
        if (v === 2) {
            return i
        }
        return -1
    }).filter(v => v >= 0)

    set.forEach(i => {
        const [op, dst, src1, src2] = instructions[i].split(' ')
        istates[i] = 3
        iStatePendingJob.push({
            iindex: i,
            remain: time.get(op),
            istate: 3,
        })
    })
}

export function writeback() {
    // console.log("writeback", istates);
    // 找到所有执行完的指令
    const set = istatesfinished.map((v, i) => {
        if (v === 3) {
            return i
        }
        return -1
    }).filter(v => v >= 0)


    set.forEach(j => {
        const readR = []

        istatesfinished.map((v, i) => {
            if (v === 1 && i < j) {
                return i
            }
            return -1
        }).filter(v => v >= 0).forEach(i => {
            const [op, dst, src1, src2] = instructions[i].split(' ')
            if (src1[0] === 'R') {
                readR.push(+src1[1])
            }
            if (src2 !== undefined && src2[0] === 'R') {
                readR.push(+src2[1])
            }
        })

        let [op, dst, src1, src2] = instructions[j].split(' ')
        if (readR.includes(+dst[1])) {
            return
        }
        switch (op) {
            case 'ADD':
                if (src1[0] === 'R') {
                    src1 = R[+src1[1]]
                }
                if (src2[0] === 'R') {
                    src2 = R[+src2[1]]
                }
                if (src1.length === 1) {
                    src1 = +src1;
                }
                if (src2.length === 1) {
                    src2 = +src2;
                }
                R[+dst[1]] = src1 + src2
                functionUnitStates[1] = undefined
                break;
            case 'SUB':
                if (src1[0] === 'R') {
                    src1 = R[+src1[1]]
                }
                if (src2[0] === 'R') {
                    src2 = R[+src2[1]]
                }
                if (src1.length === 1) {
                    src1 = +src1;
                }
                if (src2.length === 1) {
                    src2 = +src2;
                }
                R[+dst[1]] = src1 - src2
                functionUnitStates[1] = undefined
                break;

            case 'MUL':
                if (src1[0] === 'R') {
                    src1 = R[+src1[1]]
                }
                if (src2[0] === 'R') {
                    src2 = R[+src2[1]]
                }
                if (src1.length === 1) {
                    src1 = +src1;
                }
                if (src2.length === 1) {
                    src2 = +src2;
                }
                functionUnitStates[2] = undefined

                R[+dst[1]] = src1 * src2
                break;
            case 'DIV':
                if (src1[0] === 'R') {
                    src1 = R[+src1[1]]
                }
                if (src2[0] === 'R') {
                    src2 = R[+src2[1]]
                }
                if (src1.length === 1) {
                    src1 = +src1;
                }
                if (src2.length === 1) {
                    src2 = +src2;
                }
                functionUnitStates[3] = undefined
                R[+dst[1]] = src1 / src2
                break;
            case 'LD':
                if (src1[0] === 'R') {
                    src1 = R[+src1[1]]
                }
                if (src1.length === 1) {
                    src1 = +src1;
                }
                functionUnitStates[0] = undefined
                R[+dst[1]] = src1
                break;
        }
        istates[j] = 4
        iStatePendingJob.push({
            iindex: j,
            remain: 1,
            istate: 4,
        })
    })
}

export function doPendingJobs() {
    iStatePendingJob.filter(j => j.remain === 1).forEach(j => {
        istatesfinished[j.iindex] = j.istate
    })

    iStatePendingJob = iStatePendingJob.filter(j => j.remain > 1).map(j => {
        j.remain--
        return j
    })
}
export function print(clock) {
    console.log(clock, istates, functionUnitStates);
}