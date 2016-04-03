//At this point, this is just a jumble of some code that will (probably) turn into the resulting JS code

<div id="history" style="position: fixed; left: 30vw; top: -60vh; width: 35vw; max-height: 100vh; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; box-shadow: rgba(0, 0, 0, 0.498039) 0px 0px 3px 0px; background-color: rgb(21, 101, 192);"><div id="historyContent" style="
    height: 60vh;
    background-color: rgb(43, 157, 226);
"></div>
<div id="toolbar" style="
    height: 36px;
    background-color: rgb(43, 157, 226);
    border-top: 1px solid rgba(0,0,25,0.3);
    "><ul style="display: inline;padding: 0;"><li style="background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEUSURBVEhLtZLtDYIwFEUdhJ8kruAGbMACTuAETOEUjuE4xB9OoNe+K7yWflHaE0IQuecYw+nV9U2PX+DZhrYB0e4LTDa862Nx5gao9MEnFFqYFaApDJ8zOLZ0gI4U8vBWlQhwnYfXszcwfKazOYYH75CQJBbg1Md9uszTjR+MHWfObCoExC5wqSgIjLP6i7QdcKkoC1zlyrEDLhUFAbK1Ay4VBQG8SOPbZwdcKmIBwJ2N97cDbmx2B0J2wI1NIgC4Nuy1g3QAiKLADrICoMwOsgLLA1T+kZtx0oFkPk4icNAOYoHjdhAMVLEDf6CWHXgCFe3ADTh2vo8ZcLDBCsgFF8cQIVgDOPPLeqyBFnZhDbQ6uv4LhOp9ufgzKuIAAAAASUVORK5CYII=');width: 32px;height: 32px;float: left;list-style: none;margin: 1px 5px;border: 1px outset white;border-radius: 8px;" title="Disable messages from anonyms"></li><li style="list-style: none;float: left;margin: 1px 5px;background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAJUExURQAAAMPDw////97scCsAAABQSURBVBjTYwiFAgYiGQwMDKwgRgiMEQBkiIIYDotWNYDVOABFwAwgzQhmcK1axIgqgpBatAqnlFZXI6qBcIbTIi3cdqEZCHEpkBEAY5DgZQAumEHT6Ujb/gAAAABJRU5ErkJggg==');width: 32px;height: 32px;border: 1px outset white;border-radius: 8px;" title="Blacklist"></li>
<li style="
   background-image: url('data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMUExURQAAAD9IzMPDw+0cJBPbUbQAAACkSURBVBjTNdAxCgIxEAXQATtvYC8i3kNvoGC/pIhbeQJLtdZCK5VlWTKQ7WPjJbyBhWTBA9joTDLzq1d8hp/ATwLRpbSKu6ITIAq8IigiwhsoPSD0ubIh3LgyJhyXi/mrIpx39Wp6YFzr0hQJo7Wpcuc5Y7gB2oTm5K3JCLbInWjNkLBHOr0lTLzABcKFZzx4CA3DPBqiVwSFvAc6J/govgr9lj8/i6Y7/DEXAwAAAABJRU5ErkJggg==');
   width: 32px;
   height: 32px;
   float: left;
   margin: 1px 5px;
   border: 1px outset white;
   border-radius: 8px;
   list-style: none;
" title="Spam filter"></li></ul></div>
<div id="historyToggle" style="
    height: 2rem;
    text-align: center;
    font-size: 22px;
" onclick="g = document.getElementById('historyToggle'), s = g.innerHTML=='▾'; g.innerHTML = s?'▴':'▾'; document.getElementById('history').style.top = (s?'0vh':'-60vh')">▾</div></div>
