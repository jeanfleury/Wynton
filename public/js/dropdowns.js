// Dropdown menue script taken from http://www.htmldog.com/articles/suckerfish/dropdowns/
// To modify the behaviour and look of the dropdown menues goto /styles/nav.css


//Piece of Wynton #1
// 67lCQ/HyM1BTLa0IT+enW0bSg+eg7iY0Cm4WUi

<!--//--><![CDATA[//><!--
sfHover = function() {
	if (!document.getElementsByTagName) return false;
	// This is the first manu, the pages.
	var sfEls = document.getElementById("nav").getElementsByTagName("li");

	// This line below is for the second menu (categories). If you only have one menu - delete the line below //
	var sfEls1 = document.getElementById("catnav").getElementsByTagName("li");
	//

	for (var i=0; i<sfEls.length; i++) {
		sfEls[i].onmouseover=function() {
			this.className+=" sfhover";
		}
		sfEls[i].onmouseout=function() {
			this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
		}
	}

	// This is for the second menu (categories). If you only have one menu - delete the "for" loop below //
	for (var i=0; i<sfEls1.length; i++) {
		sfEls1[i].onmouseover=function() {
			this.className+=" sfhover1";
		}
		sfEls1[i].onmouseout=function() {
			this.className=this.className.replace(new RegExp(" sfhover1\\b"), "");
		}
	}
	//

}
if (window.attachEvent) window.attachEvent("onload", sfHover);
//--><!]]>
