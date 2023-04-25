<script setup>
import { reactive, ref, watch, watchEffect } from 'vue';
import { functionUnitStates, readOperand, execute, issue, writeback } from './vm/machine.js';

let cycle = 0
let cycleView = ref(0)

let code = ref(`
LD R6 R2
LD R2 R3
MUL R0 R2 R4
SUB R8 R6 R2
DIV R10 R0 R6
ADD R6 R8 R2
`)
// 指令队列
let instructions = code.value.split('\n').filter(s => s.length !== 0)

watch(code, (newV, oldV) => {
  instructions = newV.split('\n').filter(s => s.length !== 0)
})

const prevCycle = () => {
  cycleView.value--
}
// 执行时间
let time = new Map();
time.set('LD', 1)
time.set('ADD', 2)
time.set('MUL', 10)
time.set('DIV', 40)
time.set('SUB', 2)

let next = 0

let roJobs = reactive([])
let executeJobs = reactive([])
let wbJobs = reactive([])

let futureCycleJobs = []
const doFutureCycleJobs = () => {
  futureCycleJobs
    .filter(f => f.remain === 1)
    .forEach(future => {
      future.queue.push(future.job)
    })

  futureCycleJobs = futureCycleJobs.filter(f => f.remain > 1)
  futureCycleJobs = futureCycleJobs.map(f => {
    f.remain--
    return f
  })
}
const nextCycle = () => {
  cycle++
  doFutureCycleJobs()
  if (issue(instructions[next]) !== undefined) {
    console.log(cycle, " 发射 ", instructions[next]);
    update(instructions[next], cycle)
    futureCycleJobs.push({
      queue: roJobs,
      remain: 1,
      job: instructions[next],
    })
    next++
  }
  let over = readOperand(roJobs)

  over.forEach(job => {
    console.log(cycle, " 读操作数 ", job);
    update(job, cycle)
    let index = roJobs.indexOf(job);
    if (index !== -1) {
      roJobs.splice(index, 1);
    }
    futureCycleJobs.push({
      queue: executeJobs,
      remain: 1,
      job: job,
    })
  })

  over = execute(executeJobs)
  over.forEach(job => {
    console.log(cycle, " 执行 ", job);
    update(job, cycle)

    let index = executeJobs.indexOf(job);
    if (index !== -1) {
      executeJobs.splice(index, 1);
    }
    futureCycleJobs.push({
      queue: wbJobs,
      remain: time.get(job.split(' ')[0]),
      job: job,
    })
  })

  over = writeback(wbJobs)
  over.forEach(job => {
    console.log(cycle, " 写回 ", job);
    update(job, cycle)
    let index = wbJobs.indexOf(job);
    if (index !== -1) {
      wbJobs.splice(index, 1);
    }
  })
  // console.log(cycle, functionUnitStates);
  fullState.push(JSON.parse(JSON.stringify(state)))
  // if(cycleView.value === fullState.length - 1) {
  //   fullState.push(fullState[fullState.length - 1])
  // }

  cycleView.value++
}

const update = (instruction, cycle) => {
  if(state[instruction] === undefined) {
    state[instruction] = [cycle]
  }else {
    state[instruction].push(cycle)
  }
}

let fullState = [{}]

let state = {}

</script>

<template>
  <div>
    <div class="text-center text-xl">当前是第 {{ cycleView }} 个周期 <button @click="nextCycle">下一步</button> <button
        @click="prevCycle">上一步</button> </div>

    <textarea v-model="code" name="" id="" cols="30" rows="10"></textarea>
    <table class="border-collapse table-auto w-full text-sm">
      <thead>
        <tr>
          <th class="border-b  font-semibold p-4 pl-8 pt-0 pb-3 text-left">指令</th>
          <th class="border-b  font-semibold p-4 pt-0 pb-3 text-left">发射</th>
          <th class="border-b  font-semibold p-4 pr-8 pt-0 pb-3 text-left">读数</th>
          <th class="border-b  font-semibold p-4 pr-8 pt-0 pb-3 text-left">执行</th>
          <th class="border-b  font-semibold p-4 pr-8 pt-0 pb-3 text-left">写回</th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-slate-800">
        <tr v-for="i, index in instructions">
          <td class="border-b border-slate-100 dark:border-slate-700 p-2 pl-8 text-slate-500 dark:text-slate-400">{{ i }}
          </td>
          <td v-for="sv in fullState[cycleView][i]"
            class="border-b border-slate-100 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400">{{ sv }}</td>
        </tr>
      </tbody>
    </table>

    <!-- <ul class="text-xl">
      <li v-for="f in fullFuctionStateView[cycleView].filter(f => f !== undefined)">
        {{ 'busy' }}
        {{ f.op }}
        {{ 'R' + f.dst }}
        {{ f.src1 }}
        {{ f.src2 }}
      </li>
    </ul> -->

  </div>
</template>

<style scoped></style>
