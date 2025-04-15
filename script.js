const tooltip = document.getElementById('tooltip');
let data = [];
let setTimeRef = null

const scatterplot = (data) => {

    const w = 1000;
    const h = 500;
    const p = 60;

    const xScale = d3.scaleTime()
    .domain(
        [
            d3.min(data, d => {
                const date = new Date(0);
                date.setFullYear(d.Year-1);
                return date;
            }),
            d3.max(data, d => {
                const date = new Date(0);
                date.setFullYear(d.Year+1);
                return date;
            })
        ]
    )
    .range([p,w-p]);

    const yScale = d3.scaleTime()
    .domain([new Date(d3.max(data,d => {
        const [m,s] = d.Time.split(':').map(Number);
        const date = new Date(0);
        date.setMinutes(m);
        date.setSeconds(s);
        return date;
    })),d3.min(data,d => {
        const [m,s] = d.Time.split(':').map(Number);
        const date = new Date(0);
        date.setMinutes(m);
        date.setSeconds(s);
        return date;
    })])
    .range([h-p,p]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    const svg = d3.create('svg')
    .attr("width", w)
    .attr("height", h)
    .attr("id", 'scatterplotSvg')
    
    svg
    .append("g")
    .attr('id','x-axis')
    .attr("transform", `translate(0,${h-p})`)
    .call(xAxis);

    svg
    .append("g")
    .attr('id','y-axis')
    .attr("transform", `translate(${p}, 0)`)
    .call(yAxis);

    svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append('circle')
    .attr('cx',d => {
        const date = new Date(0);
        date.setFullYear(d.Year);
        return xScale(date);
    })
    .attr('cy',d => {
        {
            const [m,s] = d.Time.split(':').map(Number);
            const date = new Date(0);
            date.setMinutes(m);
            date.setSeconds(s);
            return yScale(date);
        }
    })
    .attr('r',5)
    .attr('id',(d,i) =>d.Name+i)
    .attr('data-name',d => d.Name)
    .attr('data-xvalue',d => d.Year)
    .attr('data-yvalue',d => {
        const [m,s] = d.Time.split(':').map(Number);
        const date = new Date(0);
        date.setMinutes(m);
        date.setSeconds(s);
        return date;
    })
    .attr('data-doping',d => d.Doping)
    .attr('data-nationality',d => d.Nationality)
    .attr('class','dot')
    .attr('fill',d => {
        return d.Doping ? '#3547e5': '#ff9800';
    })
    .attr('stroke-width','1')
    .attr('stroke','#000');

    svg
    .append('text')
    .attr('x',w/3)
    .attr('y',p/2)
    .attr('id','title')
    .text('Doping in Professional Bicycle Racing');

    svg
    .append('text')
    .attr('x',w/3+p)
    .attr('y',p/2+p/3)
    .attr('id','subTitle')
    .text("35 Fastest times up Alpe d'Huez");


    svg
    .append('text')
    .attr('x',p)
    .attr('y',h/2)
    .text('Time in Minutes')
    .attr("transform", `rotate(-90 ,${p-40} ,${h/2})`);

    const legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${w-300}, ${(h-p)/2})`);

    const noDopingGroup = legend.append("g")
    .attr("transform", "translate(0, 0)");

    const dopingGroup = legend.append("g")
    .attr("transform", "translate(0, 30)");

    noDopingGroup.append("rect")
    .attr("x", "10")
    .attr("width", "20")
    .attr("height", "20")
    .attr("fill", "#ff9800");

    dopingGroup.append("rect")
    .attr("x", "10")
    .attr("width", "20")
    .attr("height", "20")
    .attr("fill", "#3547e5");

    noDopingGroup.append("text")
    .attr("x", "40")
    .attr("y", "15")
    .text("No doping allegations");

    noDopingGroup.append("text")
    .attr("x", "40")
    .attr("y", "45")
    .text("Riders with doping allegations");

    document.getElementById('scatterplot-graph').appendChild(svg.node())
}

const showToolTip = (id,x,y) => {

    const dot = document.getElementById(id)
    const name = dot.getAttribute('data-name');
    const nationality = dot.getAttribute('data-nationality');
    const time = dot.getAttribute('data-yvalue');
    const year = dot.getAttribute('data-xvalue');
    const doping = dot.getAttribute('data-doping');
    tooltip.setAttribute('data-year',year);
    tooltip.innerHTML = `
        <h3>${name}: ${nationality}</h3>
        <p>Year:${year}, Time:${time}</p>
        <p>${doping&&doping}</p>
    `
    tooltip.style.left=x+10+'px';
    tooltip.style.top=y-10+'px';
    if(tooltip.classList.contains('hidden'))
        tooltip.classList.remove('hidden');

}

window.addEventListener('mouseover',(e) => {
    if(!e.target.classList.contains('dot'))
        tooltip.classList.add('hidden');
})

const addElementEvents = () => {
    const dots = document.querySelectorAll('.dot');
    if(dots){
        dots.forEach(dot => {
            dot.addEventListener('mouseover',(e) => {
                if(setTimeRef){
                    clearTimeout(setTimeRef)
                }
                setTimeRef = setTimeout(() => {
                    showToolTip(dot.getAttribute('id'), e.pageX,e.pageY);
                }, 10);
            });
        });
    }
}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
.then(res => res.json())
.then(data => {
    scatterplot(data)
    addElementEvents()
})
