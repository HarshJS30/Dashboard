"use client"
export const dynamic = "force-dynamic";
import '../globals.css'
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from 'next/navigation'

export default function DetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const dept = searchParams.get('dept')
  const post = searchParams.get('post')
  const SHEET_URL = process.env.NEXT_PUBLIC_CSV_URL || ""

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(SHEET_URL)
        if (!res.ok) throw new Error("Failed to fetch CSV")
        const text = await res.text()
        const rows = text.trim().split("\n").map(r => {
          const matches = r.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
          return matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : []
        })
        const headers = rows[0]
        const entries = rows.slice(1).map(r => {
          const obj: any = {}
          headers.forEach((h, i) => {
            obj[h.trim()] = r[i]?.trim() || ""
          })
          return obj
        })
        setData(entries)
        if (dept && post) {
          const matches = entries.filter(d => d.dept === dept && d.post === post)
          setFiltered(matches)
        }
        setLoading(false)
      } catch (err) {
        setError("Error loading data")
        setLoading(false)
        console.error(err)
       }
    }
    if (SHEET_URL) fetchData()
  }, [SHEET_URL, dept, post])

  return (
    <div className="no-mesh">
      <div className="details-container">
        <div className="details-header">
            <h1>Department Details</h1>
            <button onClick={() => router.push('/')} className="back-btn">← Back to Dashboard</button>
        </div>

        <div className="tag-container">
            <span className="tag">Dept: {dept}</span>
            <span className="tag">Post: {post}</span>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        <div className="details-grid">
            {filtered.length > 0 ? (
            filtered.map((f, i) => (
                <div key={i} className="person-card">
                {f.details?.split(",").map((line: string, j: number) => (
                    <p key={j}>{line.trim()}</p>
                ))}
                </div>
            ))
            ) : (
            !loading && <p>No details found.</p>
            )}
        </div>
        </div>
    </div>
  )
}
