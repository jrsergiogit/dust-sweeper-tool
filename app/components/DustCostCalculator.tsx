'use client'
import { useState } from 'react'

function n(v: string) {
  const x = parseFloat(v.replace(',', '.'))
  return Number.isFinite(x) && x >= 0 ? x : 0
}

export default function DustCostCalculator() {
  const [balance, setBalance] = useState('12')
  const [gas, setGas] = useState('0.40')
  const [fee, setFee] = useState('1')
  const [impact, setImpact] = useState('0.5')

  const b = n(balance)
  const g = n(gas)
  const routeFee = (b * n(fee)) / 100
  const slip = (b * n(impact)) / 100
  const net = b - g - routeFee - slip
  const keep = b > 0 ? (net / b) * 100 : 0
  const verdict = b === 0 ? 'Enter a balance to see the result.'
    : net <= 0 ? 'Not worth moving: costs are higher than the balance.'
    : keep < 50 ? 'Marginal: fees take more than half of the value.'
    : 'Likely worth it: most of the value survives the costs.'
  const tone = b === 0 ? 'text-gray-400' : net <= 0 ? 'text-red-400' : keep < 50 ? 'text-yellow-400' : 'text-emerald-400'

  const field = (label: string, value: string, set: (v: string) => void, suffix: string) => (
    <label className="block text-sm text-gray-400">
      {label}
      <div className="mt-1 flex items-center rounded-xl border border-white/10 bg-black/40 px-3">
        <input inputMode="decimal" value={value} onChange={(e) => set(e.target.value)}
          className="w-full bg-transparent py-3 text-white outline-none" />
        <span className="text-xs text-gray-500">{suffix}</span>
      </div>
    </label>
  )

  return (
    <div className="my-10 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-1 text-xl font-bold text-white">Dust cost calculator</h2>
      <p className="mb-5 text-sm text-gray-400">Enter the numbers from a live quote. Runs in your browser and never touches your wallet.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {field('Balance value', balance, setBalance, 'USD')}
        {field('Network fee (gas)', gas, setGas, 'USD')}
        {field('Route / service fee', fee, setFee, '%')}
        {field('Price impact / slippage', impact, setImpact, '%')}
      </div>
      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="text-sm text-gray-400">Estimated amount you keep</div>
        <div className={`text-3xl font-black ${tone}`}>${Math.max(net, 0).toFixed(2)}</div>
        <p className={`mt-2 text-sm ${tone}`}>{verdict}</p>
      </div>
    </div>
  )
}
