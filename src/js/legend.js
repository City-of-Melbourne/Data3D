/* jshint esnext:true */
export function showNumericLegend(id, columnName, minval, maxval, closeHandler) {
    var legendHtml = 
        (closeHandler ? '<div class="close">Close ✖</div>' : '') + 
        `<h3>${columnName}</h3>` + 

        `<span class="circle" style="height:6px; width: 6px; border-radius: 3px"></span><label>${minVal}</label><br/>` +
        `<span class="circle" style="height:20px; width: 20px; border-radius: 10px"></span><label>${maxVal}</label>`;

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
};


export function showCategoryLegend(id, columnName, colorStops, closeHandler) {
        legendHtml = 
            '<div class="close">Close ✖</div>' +
            `<h3>${columnName}</h3>` + 
            colorStops
                .sort((stopa, stopb) => stopa[0].localeCompare(stopb[0])) // sort on values
                .map(stop => `<span class="box" style='background: ${stop[1]}'></span><label>${stop[0]}</label><br/>`)
                .join('\n')
            ;

        document.querySelector(id).innerHTML = legendHtml;
        document.querySelector(id + ' .close').addEventListener('click', circleHandler);
};