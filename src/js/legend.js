/* jshint esnext:true */
export function showRadiusLegend(id, columnName, minVal, maxVal, closeHandler) {
    var legendHtml = 
        (closeHandler ? '<div class="close">Close ✖</div>' : '') + 
        `<h3>${columnName}</h3>` + 
        // TODO pad the small circle so the text starts at the same X position for both
        `<span class="circle" style="height:6px; width: 6px; border-radius: 3px"></span><label>${minVal}</label><br/>` +
        `<span class="circle" style="height:20px; width: 20px; border-radius: 10px"></span><label>${maxVal}</label>`;

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
}

export function showExtrusionHeightLegend(id, columnName, minVal, maxVal, closeHandler) {
    var legendHtml = 
        (closeHandler ? '<div class="close">Close ✖</div>' : '') + 
        `<h3>${columnName}</h3>` + 

        `<span class="circle" style="height:3px; width: 12px; background: rgb(20,20,40)"></span><label>${minVal}</label><br/>` +
        `<span class="circle" style="height:20px; width: 12px; background: rgb(40,40,250)"></span><label>${maxVal}</label>`;

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
}


export function showCategoryLegend(id, columnName, colorStops, closeHandler) {
    let legendHtml = 
        '<div class="close">Close ✖</div>' +
        `<h3>${columnName}</h3>` + 
        colorStops
            .sort((stopa, stopb) => stopa[0].localeCompare(stopb[0])) // sort on values
            .map(stop => `<span class="box" style='background: ${stop[1]}'></span><label>${stop[0]}</label><br/>`)
            .join('\n')
        ;

    document.querySelector(id).innerHTML = legendHtml;
    document.querySelector(id + ' .close').addEventListener('click', closeHandler);
}