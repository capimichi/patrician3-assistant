import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';

test('goods.json has updated, correct values and no fodder/train_oil', () => {
  const goodsPath = path.resolve(__dirname, '../../public/data/goods.json');
  const goods = JSON.parse(fs.readFileSync(goodsPath, 'utf8'));

  expect(goods.length).toBe(20);
  
  const fodder = goods.find((g: any) => g.id === 'fodder');
  expect(fodder).toBeUndefined();

  const trainOil = goods.find((g: any) => g.id === 'train_oil');
  expect(trainOil).toBeUndefined();

  const pottery = goods.find((g: any) => g.id === 'pottery');
  expect(pottery).toBeDefined();
  expect(pottery.buyPriceRange).toEqual([170, 170]);
  expect(pottery.sellPriceRange).toEqual([230, 250]);
  expect(pottery.maxSatisfactionPrice).toBe(200);

  const whaleOil = goods.find((g: any) => g.id === 'whale_oil');
  expect(whaleOil).toBeDefined();
  expect(whaleOil.buyPriceRange).toEqual([70, 75]);
  expect(whaleOil.sellPriceRange).toEqual([100, 150]);
});

test('businesses.json has pottery_workshop and whale_fishery, and no fodder inputs', () => {
  const busPath = path.resolve(__dirname, '../../public/data/businesses.json');
  const businesses = JSON.parse(fs.readFileSync(busPath, 'utf8'));

  const potteryWorkshop = businesses.find((b: any) => b.id === 'pottery_workshop');
  expect(potteryWorkshop).toBeDefined();
  expect(potteryWorkshop.outputs[0].goodId).toBe('pottery');

  const whaleFishery = businesses.find((b: any) => b.id === 'whale_fishery');
  expect(whaleFishery).toBeDefined();
  expect(whaleFishery.outputs[0].goodId).toBe('whale_oil');

  const cattleFarm = businesses.find((b: any) => b.id === 'cattle_farm');
  const hasFodderInput = cattleFarm.inputs.some((i: any) => i.goodId === 'fodder');
  expect(hasFodderInput).toBe(false);
});

test('towns.json contains only valid good ids in production list', () => {
  const townsPath = path.resolve(__dirname, '../../public/data/towns.json');
  const towns = JSON.parse(fs.readFileSync(townsPath, 'utf8'));

  towns.forEach((town: any) => {
    expect(town.produces.includes('fodder')).toBe(false);
    expect(town.produces.includes('train_oil')).toBe(false);
  });
});
