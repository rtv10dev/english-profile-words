const puppeteer = require('puppeteer');
const fs = require('fs');

//number of total words in the page
const TOTAL_WORDS = 6778;

const stream = fs.createWriteStream('words.csv', { flags: 'a' });

const del = (ms) => new Promise((res) => setTimeout(res, ms));

const getWord = async (i) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.goto(
    `https://www.englishprofile.org/british-english/words/detail/${i}`,
    {
      waitUntil: 'domcontentloaded'
    }
  );

  const words = await page.evaluate(() => {
    const words = document.querySelectorAll('.pos_section');

    const wordsData = [];

    words.forEach((wordInfo) => {
      const pos = wordInfo.querySelector('.pos').innerText;

      wordInfo.querySelectorAll('.sense').forEach((word) => {
        const title = word.querySelector('.sense_title').innerText;
        const definition = word.querySelector('.definition').innerText;
        const level = word.querySelector('.label').innerText;

        wordsData.push([title, pos, level, definition]);
      });
    });

    return wordsData;
  });

  words.forEach((w) => {
    stream.write(`"${w[0]}","${w[1]}","${w[2]}","${w[3]}"` + '\n');
  });

  await browser.close();
};

const exec = async () => {
  for (const [i, _] of [...Array(TOTAL_WORDS)].entries()) {
    await getWord(i + 1);
    await del(250);
  }
};

exec();
