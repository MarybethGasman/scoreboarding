<script setup>
import { reactive, ref, watch } from 'vue';
import { time, doPendingJobs, instructions, functionUnitStates, istates, decode, execute, print, fetch, issue, writeback } from './vm/machine.js';

let cycle = 0
let oldIStates = [...istates];
let istatesView = []

let fullCycleView = [[]]
let fullFuctionStateView = [[]]
let cycleView = ref(0)

let code = ref(`
LD R6 R2
LD R2 R3
MUL R0 R2 R4
SUB R8 R6 R2
DIV R10 R0 R6
ADD R6 R8 R2
`)
fetch(code.value)
watch(code, (newV, oldV) => {
  fetch(newV)
})

const prevCycle = () => {
  cycleView.value--
}
const nextCycle = () => {
  cycle++
  doPendingJobs()
  try {
    issue()
  } catch (error) {
    console.log(error, "程序结束", cycle);
  }
  decode()
  execute()
  writeback()
  oldIStates.forEach((v, i) => {
    if (istates[i] === v) {
      return
    }
    if (istatesView[i] === undefined) {
      istatesView[i] = []
    }
    istatesView[i].push(cycle)
    // console.log(instructions[i], cycle, v, istates[i]);
  })
  fullCycleView[cycle] = istatesView.map(arr => arr.slice())
  fullFuctionStateView[cycle] = [...functionUnitStates]
  cycleView.value++

  oldIStates = [...istates];
}
</script>

<template>
  <div>
    <div class="text-center text-xl">当前是第 {{ cycleView }} 个周期 <button @click="nextCycle">下一步</button> <button
        @click="prevCycle">上一步</button> </div>
    <p>关于机器的细节，参考
      <a class="text-blue-400 underline"
        href="https://github.com/MarybethGasman/scoreboarding/blob/master/src/vm/machine.js#L1-L25">machine.js</a> 以及
      <a class="text-blue-400 underline" href="https://github.com/MarybethGasman/scoreboarding/blob/master/src/App.vue#L29-L39">流水线循环</a>
    </p>
    <textarea v-model="code" name="" id="" cols="30" rows="10"></textarea>
    <table class="border-collapse table-auto w-full text-sm">
      <thead>
        <tr>
          <th class="border-b  font-semibold p-4 pl-8 pt-0 pb-3 text-left">指令</th>
          <th class="border-b  font-semibold p-4 pt-0 pb-3 text-left">流出</th>
          <th class="border-b  font-semibold p-4 pr-8 pt-0 pb-3 text-left">读数</th>
          <th class="border-b  font-semibold p-4 pr-8 pt-0 pb-3 text-left">执行</th>
          <th class="border-b  font-semibold p-4 pr-8 pt-0 pb-3 text-left">写回</th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-slate-800">
        <tr v-for="i, index in instructions">
          <td class="border-b border-slate-100 dark:border-slate-700 p-2 pl-8 text-slate-500 dark:text-slate-400">{{ i }}
          </td>
          <td v-for="sv, j in fullCycleView[cycleView][index]"
            class="border-b border-slate-100 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400">{{ sv }}</td>
        </tr>
      </tbody>
    </table>

    <ul class="text-xl">
      <li v-for="f in fullFuctionStateView[cycleView].filter(f => f !== undefined)">
        {{ 'busy' }}
        {{ f.op }}
        {{ 'R' + f.dst }}
        {{ f.src1 }}
        {{ f.src2 }}
      </li>
    </ul>

  </div>
</template>

<style scoped></style>
