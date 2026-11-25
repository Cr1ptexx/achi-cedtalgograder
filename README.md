# Algo Lab

เว็บเรียน Algorithm แบบลงมือทำ: แต่ละบทสรุปแนวคิดเป็นโซน มีตัวจำลองให้กดทีละขั้น quiz สั้น ๆ
แล้วต่อด้วยโจทย์ C++ ที่ **คอมไพล์และตรวจได้ในเบราว์เซอร์** โดยไม่มี backend

> ใช้เพื่อการศึกษา สำหรับวิชา Data Structures and Algorithms ของ CEDT (use for educational purpose)

## ฟีเจอร์

- **บทเรียนแบบโซน** — แนวคิด → ลองเล่น (visualizer) → เช็กความเข้าใจ → ความซับซ้อน → โจทย์แนะนำ
- **10 บทเรียน** — ตั้งแต่ Brute Force ถึง NP-Complete แต่ละบทมีตัวจำลองของตัวเอง (permutation, sorting, Master Theorem, binary search, DP ตาราง, greedy, BFS/DFS/Kruskal, Dijkstra/Floyd, N-Queens, อัตราการโต)
- **โจทย์ 63 ข้อ** — ทุกข้อเขียนและตรวจได้ในเบราว์เซอร์ รวมชุดข้อสอบปลายภาคเก่าปี 66–68
- **หน้าความก้าวหน้า** — heat map การฝึก, streak, เลเวล/XP และเส้นทางแต่ละบท (เก็บในเบราว์เซอร์)
- **โซน LeetCode** — ข้อฝึกเพิ่มของแต่ละบท (ลิงก์เท่านั้น ไม่คัดลอกโจทย์) ติ๊กได้ว่าทำแล้ว
- **ตัวตรวจโค้ดในเบราว์เซอร์** — เขียน C++17 แล้วตรวจกับชุดทดสอบได้ทันที แยกผล AC / WA / TLE / RE พร้อมบอกบรรทัดแรกที่ต่าง
- **คำใบ้แบบขั้นบันได** — โผล่หลังตรวจไม่ผ่าน และเปิดทีละขั้นเมื่อผู้ใช้กดเอง
- **หน้าแผน** — รวมทุกโจทย์ตามบท พร้อมสถานะ ยังไม่ทำ / ลองแล้ว / ผ่าน (เก็บในเบราว์เซอร์)

## การออกแบบระบบ

```
┌──────────── main thread (React) ────────────┐
│  ProblemPage ──► CppRunner                  │
│                   │ compile(code)           │
│                   ▼                         │
│        ┌─ compile worker (คงอยู่ตลอด) ─┐       │
│        │ clang.wasm + lld.wasm        │       │
│        │ → user.wasm (ArrayBuffer)    │       │
│        └──────────────┬───────────────┘       │
│                       ▼ runTests(wasm, tests) │
│        ┌─ exec worker (ทิ้งได้) ─────────┐       │
│        │ WASI shim + stdin → stdout    │       │
│        └───────────────────────────────┘       │
│   timeout → terminate() + สร้างใหม่ = TLE       │
└───────────────────────────────────────────┘
```

- **ไม่มี server**: ใช้ [binji/wasm-clang](https://github.com/binji/wasm-clang) (clang/lld คอมไพล์เป็น WebAssembly) โหลดตอนใช้งานครั้งแรกแล้วเบราว์เซอร์ cache ไว้ จึง deploy เป็น static site บน GitHub Pages ได้
- **แยก worker สองตัว**: ตัวคอมไพล์ถือ clang ไว้ตลอด (โหลดหนักครั้งเดียว) ส่วนตัวรันโปรแกรมผู้ใช้เบามาก ถ้าเจอ loop ไม่จบ ฝั่งหลักแค่ `terminate()` ตัวรันแล้วสร้างใหม่ — ได้ TLE ที่แท้จริงโดยไม่ต้องโหลด compiler ซ้ำ
- **ตรวจผลแบบ grader**: ตัดช่องว่างท้ายบรรทัดและบรรทัดว่างท้ายไฟล์ก่อนเทียบ
- **เนื้อหาเป็นข้อมูล**: บท โจทย์ เทส คำใบ้ อยู่ใน `src/data/` เพิ่มบทหรือโจทย์ใหม่โดยไม่ต้องแตะ UI
- รองรับ `#include <bits/stdc++.h>` (libc++ ไม่มีไฟล์นี้ จึงสร้างให้ใน memfs ตอนเริ่ม)

## โครงสร้าง

```
public/runner/worker.js   C++ compile/exec worker
src/runner/cppRunner.ts   main-thread client, timeouts, output compare
src/data/                 chapters, catalog (โจทย์ทั้งหมด), problems + tests
src/components/           visualizers, stepper, quiz
src/pages/                Home, Chapter, Problem, Plan
```

## รัน

```bash
npm install
npm run dev      # http://localhost:5199
npm run build    # static files in dist/
```

## ชุดทดสอบ

`npm run tests` สร้าง `public/tests/<code>.json` ของแต่ละโจทย์จาก 3 แหล่ง:

1. ตัวอย่างในโจทย์ (`sample`)
2. เทสจาก grader ที่แสดงครบ (`tests-src/<code>.grader.json`)
3. เทสที่สร้างเพิ่ม (`generated`) — input จาก generator ที่ seed คงที่ คำตอบจากเฉลยอ้างอิง

เฉลยอ้างอิงอยู่ใน `_source/ref/` (ไม่ขึ้น git) และสคริปต์จะ **หยุดทันที** ถ้าเฉลยตอบไม่ตรงกับตัวอย่างหรือเทสของ grader แม้แต่ชุดเดียว
แต่ละโจทย์ใช้ checker ใดชนิดหนึ่ง: `exact` (เทียบทีละบรรทัด), `lines-any-order` (พิมพ์ลำดับไหนก็ได้), `float` (ยอมทศนิยมคลาดเคลื่อน) หรือ `custom` (ตรวจด้วย validator ใน `src/runner/validators.ts` สำหรับโจทย์ที่ตอบได้หลายแบบ)

โมดูลของแต่ละโจทย์อยู่ใน `scripts/problems/<code>.mjs` (ตัวอย่าง, generator, อินพุตเล็กสำหรับเทียบกับ brute force) สร้างด้วย `node scripts/build-tests.mjs [ชื่อบางส่วน]` เทสที่เบราว์เซอร์รันนานเกินไป (เกิน 500 ms บนเครื่องจริง) จะถูกตัดออกและแจ้งไว้ในหน้าโจทย์

## ข้อ LeetCode

`node scripts/fetch-leetcode.mjs` สร้าง `src/data/leetcode.ts` โดยตรวจกับข้อมูลสาธารณะของ LeetCode ว่าทุกข้อมีอยู่จริงและไม่ใช่ข้อเฉพาะสมาชิก (เก็บเฉพาะ id ชื่อ ระดับ และโน้ตของผู้จัดทำ ไม่มีเนื้อโจทย์)

เทสใหญ่ถูกออกแบบให้แยกวิธีที่ช้าออกจากวิธีที่ถูก เช่น Permutation with Constraint ถ้าไม่ตัดกิ่งจะได้ TLE 3 ชุดสุดท้าย

## ที่มาของเนื้อหา

โจทย์และชุดทดสอบมาจาก grader ของวิชา (cedt-grader.nattee.net) คำอธิบายแนวคิดเขียนใหม่ด้วยคำของผู้จัดทำ

## ฝึกในเครื่องด้วย VS Code

`node scripts/make-practice.mjs [โฟลเดอร์ปลายทาง] [โฟลเดอร์ workspace]` สร้างโฟลเดอร์ฝึกครบทุกข้อ (ไฟล์ `.cpp` เริ่มต้น, `statement.pdf`, `tests/`) พร้อมตัวตรวจในเครื่อง `judge.mjs`, tasks ของ VS Code และการผูกไฟล์กับ problem id สำหรับส่วนขยาย cedt-grader-submit ไม่เขียนทับไฟล์เฉลยที่มีอยู่แล้ว (ต้องมี `_source/statements/` ซึ่งไม่ขึ้น git)
