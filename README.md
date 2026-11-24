# Algo Lab

เว็บเรียน Algorithm แบบลงมือทำ: แต่ละบทสรุปแนวคิดเป็นโซน มีตัวจำลองให้กดทีละขั้น quiz สั้น ๆ
แล้วต่อด้วยโจทย์ C++ ที่ **คอมไพล์และตรวจได้ในเบราว์เซอร์** โดยไม่มี backend

> ใช้เพื่อการศึกษา สำหรับวิชา Data Structures and Algorithms ของ CEDT (use for educational purpose)

## ฟีเจอร์

- **บทเรียนแบบโซน** — แนวคิด → ลองเล่น (visualizer) → เช็กความเข้าใจ → ความซับซ้อน → โจทย์แนะนำ
- **Visualizer ทีละขั้น** — backtracking สร้าง permutation (พร้อมโหมดตัดกิ่ง) และ sorting 5 แบบพร้อมตัวนับการเทียบ/สลับ
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
โจทย์ที่คำตอบไม่ซ้ำแบบเดียว (เช่น พิมพ์ลำดับไหนก็ได้) ใช้ checker `lines-any-order`

เทสใหญ่ถูกออกแบบให้แยกวิธีที่ช้าออกจากวิธีที่ถูก เช่น Permutation with Constraint ถ้าไม่ตัดกิ่งจะได้ TLE 3 ชุดสุดท้าย

## ที่มาของเนื้อหา

โจทย์และชุดทดสอบมาจาก grader ของวิชา (cedt-grader.nattee.net) คำอธิบายแนวคิดเขียนใหม่ด้วยคำของผู้จัดทำ
