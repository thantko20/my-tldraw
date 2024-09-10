import { Tldraw } from "tldraw"
import "tldraw/tldraw.css"

export default function TldrawPage() {
  return (
    <div className="fixed inset-0">
      <Tldraw />
    </div>
  )
}
