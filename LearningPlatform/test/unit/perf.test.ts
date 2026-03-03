import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeAsync } from '@/lib/utils'

describe('perf', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('timeAsync', () => {
    it('should return result and execution time', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 'test result'
      }

      const { result, ms } = await timeAsync('test-operation', testFn)

      expect(result).toBe('test result')
      // The timer slept for ~50 ms; allow a wide low-end tolerance (5 ms) to
      // avoid spurious failures on heavily-loaded CI nodes where the Node.js
      // event loop may be delayed before or after the setTimeout fires.
      expect(ms).toBeGreaterThanOrEqual(5)
      expect(ms).toBeLessThan(1000) // generous upper bound
    })

    it('should handle immediate resolution', async () => {
      const testFn = async () => 42

      const { result, ms } = await timeAsync('immediate', testFn)

      expect(result).toBe(42)
      expect(ms).toBeGreaterThanOrEqual(0)
    })

    it('should handle functions that throw errors', async () => {
      const testFn = async () => {
        throw new Error('Test error')
      }

      await expect(
        timeAsync('error-operation', testFn)
      ).rejects.toThrow('Test error')
    })

    it('should handle functions returning objects', async () => {
      const testObj = { id: 123, name: 'test' }
      const testFn = async () => testObj

      const { result, ms } = await timeAsync('object-operation', testFn)

      expect(result).toEqual(testObj)
      expect(ms).toBeGreaterThanOrEqual(0)
    })

    it('should handle functions returning null/undefined', async () => {
      const nullFn = async () => null
      const undefinedFn = async () => undefined

      const nullResult = await timeAsync('null-op', nullFn)
      const undefinedResult = await timeAsync('undefined-op', undefinedFn)

      expect(nullResult.result).toBeNull()
      expect(undefinedResult.result).toBeUndefined()
    })

    it('should log performance in non-production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const testFn = async () => 'result'
      await timeAsync('dev-operation', testFn)

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[perf\] dev-operation: \d+\.\d+ms/)
      )

      process.env.NODE_ENV = originalEnv
    })

    it('should not log in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const testFn = async () => 'result'
      await timeAsync('prod-operation', testFn)

      expect(console.log).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should handle async operations with varying durations', async () => {
      const durations = [5, 10, 20]

      for (const duration of durations) {
        const testFn = async () => {
          await new Promise(resolve => setTimeout(resolve, duration))
          return duration
        }

        const { result, ms } = await timeAsync(`op-${duration}ms`, testFn)

        expect(result).toBe(duration)
        // Allow generous tolerance for CI timing jitter (±10ms)
        expect(ms).toBeGreaterThanOrEqual(duration - 10)
      }
    })

    it('should handle functions returning arrays', async () => {
      const testArray = [1, 2, 3]
      const testFn = async () => testArray

      const { result, ms } = await timeAsync('array-operation', testFn)

      expect(result).toEqual(testArray)
      expect(ms).toBeGreaterThanOrEqual(0)
    })

    it('should preserve function execution context', async () => {
      let executionOrder: string[] = []

      const testFn = async () => {
        executionOrder.push('start')
        await new Promise(resolve => setTimeout(resolve, 5))
        executionOrder.push('end')
        return 'done'
      }

      await timeAsync('context-test', testFn)

      expect(executionOrder).toEqual(['start', 'end'])
    })
  })
})
