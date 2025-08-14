import React from 'react'
export default function LineChart({data, xKey, yKeys, height=200}){
  const width = 1000
  const padding = 40
  const xs = data.map(d=>d[xKey])
  const ys = yKeys.flatMap(k=>data.map(d=>d[k]))
  const minY = Math.min(...ys) * 0.95
  const maxY = Math.max(...ys) * 1.05
  const xStep = (width - padding*2) / (data.length - 1)
  const yScale = v => {
    if (maxY === minY) return height/2
    return height - padding - ((v - minY)/(maxY - minY))*(height - padding*2)
  }
  const xScale = i => padding + i * xStep
  const toPath = key => {
    return data.map((d,i)=>`${i===0?'M':'L'} ${xScale(i)} ${yScale(d[key])}`).join(' ')
  }
  return (
    <svg className="svgchart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <g opacity="0.25">
        {data.map((_,i)=> i>0 && <line key={i} x1={xScale(i)} y1={padding} x2={xScale(i)} y2={height-padding} stroke="currentColor"/>)}
        <line x1={padding} y1={yScale(minY)} x2={width-padding} y2={yScale(minY)} stroke="currentColor"/>
      </g>
      {yKeys.map((k,idx)=>(
        <path key={k} d={toPath(k)} fill="none" stroke="currentColor" strokeWidth="2" opacity={1 - idx*0.3}/>
      ))}
      {data.map((d,i)=>(
        <g key={i}>
          {yKeys.map((k,idx)=>(
            <circle key={k} cx={xScale(i)} cy={yScale(d[k])} r="3" fill="currentColor" opacity={1 - idx*0.3}/>
          ))}
        </g>
      ))}
      <g fontSize="12">
        {data.map((d,i)=>(<text key={i} x={xScale(i)} y={height-10} textAnchor="middle">{d[xKey]}</text>))}
      </g>
    </svg>
  )
}