import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TypingGame from '../src/components/TypingGame.vue';

let wrapper;
const key = (value, options = {}) => window.dispatchEvent(new KeyboardEvent('keydown', { key: value, cancelable: true, ...options }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  localStorage.clear();
  wrapper = mount(TypingGame);
});
afterEach(() => {
  wrapper.unmount();
  vi.useRealTimers();
});

describe('typing game', () => {
  it('starts with finite statistics and ignores keys before starting', () => {
    key('T');
    expect(wrapper.vm.charCount).toBe(0);
    expect(wrapper.vm.wpm).toBe(0);
    expect(wrapper.vm.accuracy).toBe(0);
  });

  it('counts mistakes and newlines, finishes and saves the complete result', async () => {
    await wrapper.setData({ sentence: 'a\nb' });
    await wrapper.find('button').trigger('click');
    vi.advanceTimersByTime(500);
    key('x');
    key('Shift');
    key('a');
    key('Enter');
    vi.advanceTimersByTime(500);
    key('b');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isRunning).toBe(false);
    expect(wrapper.vm.charCount).toBe(3);
    expect(wrapper.vm.missTypes).toBe(1);
    expect(wrapper.vm.accuracy).toBe(75);
    expect(wrapper.vm.keyPressLogs).toHaveLength(4);
    expect(wrapper.find('#result-modal').classes()).toContain('is-active');
    const results = JSON.parse(localStorage.getItem('typingGameResults'));
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ missTypeStats: { a: 1 }, keyPerSecond: 3, wpm: 36 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retry resets mistakes and repeated starts leave only one timer', async () => {
    await wrapper.setData({ sentence: 'a' });
    wrapper.vm.startGame();
    key('x');
    key('a');
    await wrapper.vm.$nextTick();
    await wrapper.find('#result-modal .button').trigger('click');
    wrapper.vm.startGame();
    expect(wrapper.vm.missTypes).toBe(0);
    expect(wrapper.vm.keyPressLogs).toHaveLength(0);
    expect(wrapper.vm.charCount).toBe(0);
    expect(wrapper.vm.showResultModal).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('customizing stops play; cancel preserves the sentence and save replaces it', async () => {
    wrapper.vm.startGame();
    const oldSentence = wrapper.vm.sentence;
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.vm.isRunning).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    await wrapper.find('textarea').setValue('ab');
    key('T');
    expect(wrapper.vm.charCount).toBe(0);
    await wrapper.find('[aria-label="Close customize"]').trigger('click');
    expect(wrapper.vm.sentence).toBe(oldSentence);
    wrapper.vm.openCustomizeModal();
    await wrapper.find('textarea').setValue('ab');
    await wrapper.find('#customize-modal .button').trigger('click');
    expect(wrapper.vm.sentence).toBe('ab');
    expect(wrapper.vm.showCustomizeModal).toBe(false);
  });

  it('rejects empty custom sentences and handles modal background dismissal', async () => {
    wrapper.vm.openCustomizeModal();
    await wrapper.find('textarea').setValue('');
    expect(wrapper.find('#customize-modal .button').attributes('disabled')).toBeDefined();
    const original = wrapper.vm.sentence;
    wrapper.vm.saveTypingSentence();
    expect(wrapper.vm.sentence).toBe(original);
    await wrapper.find('#customize-modal .modal-background').trigger('click');
    expect(wrapper.vm.showCustomizeModal).toBe(false);
    await wrapper.setData({ showResultModal: true });
    await wrapper.find('#result-modal .modal-background').trigger('click');
    expect(wrapper.vm.showResultModal).toBe(false);
  });

  it('ignores input-method composition and browser shortcuts', () => {
    wrapper.vm.startGame();
    key('T', { isComposing: true });
    key('T', { ctrlKey: true });
    key('T', { metaKey: true });
    expect(wrapper.vm.keyPressLogs).toHaveLength(0);
  });

  it('accepts printable Option and AltGraph characters', async () => {
    await wrapper.setData({ sentence: 'ø@' });
    wrapper.vm.startGame();
    key('ø', { altKey: true });
    key('@', { altKey: true, ctrlKey: true, modifierAltGraph: true });
    expect(wrapper.vm.charCount).toBe(2);
    expect(wrapper.vm.missTypes).toBe(0);
  });

  it('recovers from corrupt history and cleans up its timer and key listener', () => {
    localStorage.setItem('typingGameResults', '{broken');
    wrapper.vm.saveGameResult();
    expect(JSON.parse(localStorage.getItem('typingGameResults'))).toHaveLength(1);
    localStorage.setItem('typingGameResults', '{}');
    wrapper.vm.saveGameResult();
    expect(JSON.parse(localStorage.getItem('typingGameResults'))).toHaveLength(1);
    wrapper.vm.startGame();
    const vm = wrapper.vm;
    wrapper.unmount();
    key('T');
    expect(vm.charCount).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
