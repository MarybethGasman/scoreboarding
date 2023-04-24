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


// 寄存器编号从0-14
let R = new Array(15).fill(0)

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
export let functionUnitStates = {}

let result = new Array(15)

// 下一个将要issue的指令
let next = 0;



// 一些未来周期的修改istatesfinished的任务
export let iStateFinishedPendingJob = []

export function issue(instruction) {

    if (instruction === undefined) {
        return undefined
    }

    let [op, dst, src1, src2] = instruction.split(' ')
    op = op === "SUB" ? "ADD" : op
    src1 = +src1?.slice(1)
    src2 = +src2?.slice(1)
    dst = +dst?.slice(1)
    if ((result[dst]?.done ?? true) === false
        || (functionUnitStates[op]?.done ?? true) === false) {
        return undefined
    }

    console.log("issue", instruction);
    functionUnitStates[op] = {
        busy: true,
        op: op,
        src1: src1,
        src2: src2,
        q1: result[src1],
        q2: result[src2],
        r1: result[src1] === undefined,
        r2: result[src2] === undefined,
        dst: dst,
        done: false
    }

    result[dst] = functionUnitStates[op]
    return instruction
}

export function readOperand(instruction) {

    if (instruction === undefined) {
        return undefined
    }

    let [op, dst, src1, src2] = instruction.split(' ')
    if ((functionUnitStates[op]?.q1?.done ?? true) === false
        || (functionUnitStates[op]?.q2?.done ?? true) === false) {
        return undefined
    }
    src1 = +src1?.slice(1)
    src2 = +src2?.slice(1)
    dst = +dst?.slice(1)


    console.log("读操作数", instruction);

    return instruction
}


export function execute(instruction) {

    if (instruction === undefined) {
        return undefined
    }

    let [op, dst, src1, src2] = instruction.split(' ')
    src1 = +src1?.slice(1)
    src2 = +src2?.slice(1)
    dst = +dst?.slice(1)
    console.log("执行", instruction);
    return instruction
}

export function writeback(instruction) {

    if (instruction === undefined) {
        return undefined
    }
    let [op, dst, src1, src2] = instruction.split(' ')
    src1 = +src1?.slice(1)
    src2 = +src2?.slice(1)
    dst = +dst?.slice(1)
    console.log("写回", instruction);

    result[dst].done = true
    functionUnitStates[op] = undefined
    return instruction
}

export function doPendingJobs() {
    iStateFinishedPendingJob.filter(j => j.remain === 1).forEach(j => {
        istatesfinished[j.iindex] = j.istate
    })

    iStateFinishedPendingJob = iStateFinishedPendingJob.filter(j => j.remain > 1).map(j => {
        j.remain--
        return j
    })
}
export function print(clock) {
    console.log(clock, istates, functionUnitStates);
}