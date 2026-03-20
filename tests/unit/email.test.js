import { describe, expect, it } from 'vitest'
import { emailPattern, normalizeFullWidth, realEmailPattern } from '../../src/scripts/email.ts'

const emailFixtures = [
  'ｔｕｎ１２３＠ｇｍａｉｌ．ｃｏｍ',
  'ｔｕｎ１２３＠ｇｍａｉｌ。ｃｏｍ',
  'ｔｕｎ．ｌｉｎ＠ｇｍａｉｌ．ｃｏｍ',
  'ｔｕｎ．ｌｉｎ＠ｇｍａｉｌ。ｃｏｍ',
  'ｔｕｎ＿ｌｉｎ＠ｙａｈｏｏ．ｃｏｍ',
  'ｔｕｎ＿ｌｉｎ＠ｙａｈｏｏ。ｃｏｍ',
  'ｔｕｎ－ｌｉｎ＠ｏｕｔｌｏｏｋ．ｃｏｍ',
  'ｔｕｎ－ｌｉｎ＠ｏｕｔｌｏｏｋ。ｃｏｍ',
  'ｔｕｎ＋ｔｅｓｔ＠ｅｘａｍｐｌｅ．ｃｏｍ',
  'ｔｕｎ＋ｔｅｓｔ＠ｅｘａｍｐｌｅ。ｃｏｍ',
  'ｕｓｅｒ００１＠ｍａｉｌ．ｎｅｔ',
  'ｕｓｅｒ００１＠ｍａｉｌ。ｎｅｔ',
  'ｄｅｍｏ１２３＠ｓｅｒｖｉｃｅ．ｊｐ',
  'ｄｅｍｏ１２３＠ｓｅｒｖｉｃｅ。ｊｐ',
  'ａｌｐｈａ－９９＠ｄｏｍａｉｎ．ｏｒｇ',
  'ａｌｐｈａ－９９＠ｄｏｍａｉｎ。ｏｒｇ',
  'ｂｅｔａ＿８８＠ｗｅｂ．ｉｏ',
  'ｂｅｔａ＿８８＠ｗｅｂ。ｉｏ',
  'ｇａｍｍａ＋７７＠ｓｉｔｅ．ｄｅｖ',
  'ｇａｍｍａ＋７７＠ｓｉｔｅ。ｄｅｖ',
  'ｎａｍｅ－ｔｅｓｔ＠ｃｏｍｐａｎｙ．ｃｏｍ',
  'ｎａｍｅ＿ｔｅｓｔ＠ｃｏｍｐａｎｙ。ｃｏｍ',
  'tun123＠gmail.com',
  'ｔｕｎ123@gmail.com',
  'tun１２３@gmail.com',
  'tun123@gmail．com',
  'tun123@gmail。com',
  'tun.lin＠gmail.com',
  'ｔｕｎ.lin@gmail.com',
  'tun．lin@gmail.com',
  'tun_lin@yahoo。com',
  'tun＿lin@yahoo.com',
  'tun-lin@outlook。com',
  'tun－lin@outlook.com',
  'tun+test@example。com',
  'tun＋test@example.com',
  'user001@mail。net',
  'user００１@mail.net',
  'demo123@service。jp',
  'alpha-99@domain。org',
  'beta_88@web。io',
  'gamma+77@site。dev',
  'a.b@example。com',
  'a。b@example。com',
  'a．b@example。com',
  '-user@example．com',
  '－user@example.com',
  '＿user@example.com',
]

const invalidEmailFixtures = [
  // '...@... ...',
  'a..b@example.com',
  '.ab@example.com',
  '。ab@example.com',
  'ab.@example.com',
  'ab。@example.com',
  'abc@-example.com',
  'abc@－example.com',
  'abc@_example.com',
  'abc@＿example.com',
  'abc@example-.com',
  'abc@example－.com',
  'abc@exam_ple.com',
  'abc@exam＿ple.com',
  'たろう@example.com',
  'たろう＠example.com',
  'たろう＠ｅｘａｍｐｌｅ．ｃｏｍ',
  'テスト@example.com',
  'テスト＠example.com',
  '山田@example.com',
  '田中太郎@example.com',
  'かなかな@example.com',
  'カナカナ@example.com',
  '東京@example.com',
  '日本語@example.com',
  'user@やまだ.com',
  'user＠やまだ。com',
  'test@東京.jp',
  'test＠東京。jp',
]

describe('email helpers', () => {
  it('accepts full-width email strings with the email pattern', () => {
    for (const email of emailFixtures) {
      expect(emailPattern.test(email), `Expected ${email} to match`).toBe(true)
    }
  })

  it('full-width email strings to fail real email test', () => {
    for (const email of emailFixtures) {
      expect(realEmailPattern.test(email), `Expected ${email} to fail`).toBe(false)
    }
  })

  it('normalizes full-width email strings to pass real email test', () => {
    for (const email of emailFixtures) {
      const normalizedEmail = normalizeFullWidth(email)
      expect(realEmailPattern.test(normalizedEmail), `Expected ${email} to match`).toBe(true)
    }
  })

  it('invalid email strings to pass kana email test', () => {
    for (const email of invalidEmailFixtures) {
      expect(emailPattern.test(email), `Expected ${email} to match`).toBe(true)
    }
  })

  it('invalid email strings to fail real email test', () => {
    for (const email of invalidEmailFixtures) {
      expect(realEmailPattern.test(normalizeFullWidth(email)), `Expected ${email} to fail`).toBe(false)
    }
  })
})
