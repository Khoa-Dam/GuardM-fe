"use client"

import dynamic from "next/dynamic"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

export default function MapPage() {
    return (
        <div className="bg-white shadow rounded-xl p-4 h-[80vh]">
            <h2 className="text-lg font-semibold mb-4">Bản đồ các vụ án / nghi phạm truy nã</h2>
            <div className="h-full w-full">
                <MapView />
            </div>
        </div>
    )
}
