$(document).ready(function() {
	recallAll();

	CKEDITOR.config.resize_enabled = false;

	var count = 1;

	var isDisplaying = false;

	var isFixing = false;

	var fix;						//수정 경로 저장

	$("#addnote").click(function(){
		var title = $(".title").find('input:text').val();
		title = title.substring(0,title.length).bold();

		var hashtag = $(".hashtag").find('input:text').val();
		var splitHashtag = hashtag.split(',');

		var body = CKEDITOR.instances.editor1.getData();
		var dt = new Date();
		var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
		
		if(title.length === 0 ){
			alert("제목을 적어주세요");
			return;
		}
		if(body.length === 0){
			alert("내용을 적어주세요");
			return;
		}

		if(isFixing == true){
			$(fix).find("div.titlespace").text("").append(title);
			$(fix).find("div.timespace").text("").append(time);
			$(fix).find("div.bodyspace").text("").append(body);
			$(fix).find("div.hashline").text("").append(hashtag);

			$('input:text').val('');
			CKEDITOR.instances.editor1.setData("");

			$(fix).css({"height" : "auto"});
			$(".page").css({"border" : "1px solid black"});
			$(".topspace").css("border-bottom" , "1px solid black");
			$("#addnote").html("").append("<span class='glyphicon glyphicon-plus'></span>");
			
			var fixtime = $(fix).find("div.timespace").text();

			var fbfix = firebase.database().ref('posts');
			var query = fbfix.orderByChild('time').equalTo(fixtime);
			query.on('child_changed',function(data){
				changePost(data.key,title,time,body,hashtag);
			});

			isFixing = false;
			return;
		}

		mkPage(title,time,body,hashtag);
		count++;

		$('input:text').val("");
		CKEDITOR.instances.editor1.setData("");

		writeNewPost(title,time,body,hashtag);
	});

	function mkPage(title,time,body,hashtag){
		$(".timeline").append( "<div class='page'></div>" );
		$(".page").css({"border" : "1px solid black","width" : "100%",
			"display" : "inline-block","clear" : "both","float" : "left"});
		$(".page").css("margin", "10px 0px");
		$(".page:after").css({"content" : " ","display" : "block","clear" : "both"});

		var pages = $(".page");

		$(pages[count - 1]).append("<div class='topspace'></div>");
		$(pages[count - 1]).find(".topspace").append("<div class='titlespace'></div>");
		$(pages[count - 1]).find(".topspace").append("<div class='timespace'></div>");
		$(".topspace").css({"width" : "100%" , "height" : "50px"});
		$(".topspace").css({"display" : "inline-block","float" : "left"});
		$(".topspace").css("border-bottom" , "1px solid black");
		$(".topspace").css({"padding-top" : "5px","padding-left" : "10px"});


		$(pages[count - 1]).append("<div class='bodyspace'></div>");
		$(".bodyspace").css({"padding" : "0px 10px"});

		
		$(pages[count - 1]).find("div.titlespace").append(title);
		$(pages[count - 1]).find("div.timespace").append(time);

		
		$(pages[count - 1]).find("div.bodyspace").append(body);
		$(pages[count - 1]).css({"overflow" : "hidden","height" : "auto"});
		
		$(pages[count - 1]).append("<div class='hashline'></div>");

		var hashs = $(".hashline");

		$(hashs[count - 1]).append(hashtag);
		$(hashs[count - 1]).css({"width" : "100%","height":"20px","background-color" : "#e5e5e5"});

		$(pages[count - 1]).append("<div class='bottomline'></div>");

		var bottoms = $(".bottomline");

		$(bottoms[count - 1]).append("<button id='fix'>수정</button>");
		$(bottoms[count - 1]).append("<button id='delete'>삭제</button>");
		$(bottoms[count - 1]).css({"width" : "100%","height":"20px","background-color" : "#e5e5e5"});

		if(count > 1){
			$(pages[count - 1]).insertBefore(pages[0]);
		}
	}
	$(document).on('click','#fix',function() {
		isFixing = true;
		fix = $(this).parent().parent();
		$(".title").find('input:text').val($(fix).find("div.titlespace").text());
		$(".hashtag").find('input:text').val($(fix).find("div.hashline").text());
		CKEDITOR.instances.editor1.setData($(fix).find("div.bodyspace").text());

		$(fix).css({"border" : "1px solid red"});
		$(fix).find(".topspace").css("border-bottom" , "1px solid red");

		$("#addnote").html("").append("<span class='glyphicon glyphicon-ok'></span>");
	});

	$(document).on('click','#delete',function() {
		var del = $(this).parent().parent();
		var deltime = del.find("div.timespace").text();
		$(del).remove();

		var fbdel = firebase.database().ref('posts');
		var query = fbdel.orderByChild('time').equalTo(deltime);
		query.on('child_added',function(snapshot){
			snapshot.ref.remove();
		})

		count--;
	});

	$(document).on('click','#home',function() {
		if(isDisplaying == false){
			$(".searchbox").css({"display" : "inline-block"});
			isDisplaying = true;
		}else{
			$(".searchbox").css({"display" : "none"});
			isDisplaying = false;
			showPage();
		}
	});

	$(document).keydown(function(event){
		if(event.keyCode == '13'){
			var text = $(".searchbox").find('input:text').val();
			hashChecking(text);
		}
	});

	function hashChecking(text){
			hidePage();
			var hash = $(".hashline");
			var pages = $(".page");
			for(var i = 0 ; i < hash.length ; i++){
				var hashtags = $(hash[i]).text().split(',');

				for(var j in hashtags){
					if(text === hashtags[j]){
						$(pages[i]).show();
					}
				}
				
			}
		}
	function hidePage(){
		var pages=$(".page");
		for(var i = 0; i < (count-1) ; i++){
			$(pages[i]).hide();
		}
	}

	function showPage(){
		var pages=$(".page");
		for(var i = 0; i < (count-1) ; i++){
			$(pages[i]).show();
		}
	}

	function setResponsive(){
		var width = window.innerWidth;
		
		if(width < 744){
			$(".middle").css({"width" : "100%"});
		}else if(width < 989){
			$(".middle").css({"width" : "80%"});
		}else if(width < 1187){
			$(".middle").css({"width" : "60%"});
		}else if(width < 1484){
			$(".middle").css({"width" : "50%"});
		}else{
			$(".middle").css({"width" : "40%"});
		}
	}
	function forMoblie(){
			CKEDITOR.replace('editor1',
    		{
    			toolbarGroups : [
				{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
				{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
				{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
				{ name: 'forms', groups: [ 'forms' ] },
				{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
				{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
				{ name: 'links', groups: [ 'links' ] },
				{ name: 'insert', groups: [ 'insert' ] },
				'/',
				{ name: 'styles', groups: [ 'styles' ] },
				{ name: 'colors', groups: [ 'colors' ] },
				{ name: 'tools', groups: [ 'tools' ] },
				{ name: 'others', groups: [ 'others' ] },
				{ name: 'about', groups: [ 'about' ] }
			],
			removeButtons : 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,RemoveFormat,NumberedList,BulletedList,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Font,FontSize,Maximize,ShowBlocks,About',
        	height:'294px',
        	filebrowserBrowseUrl: '/browser/browse.php?type=Files',
    		filebrowserUploadUrl: '/uploader/upload.php?type=Files'
    	});
		
	}
	function forDesktop(){
	CKEDITOR.replace('editor1',
    {
        height:'294px',
        filebrowserBrowseUrl: '/browser/browse.php?type=Files',
    	filebrowserUploadUrl: '/uploader/upload.php?type=Files'
    });
	}

	$( window ).resize(function() {
  		setResponsive();
	});

	var width = window.innerWidth;

	setResponsive();

	if(width < 744)
		forMoblie();
	else{
		forDesktop();
	}

	function writeNewPost(title, time, body,hashtag) {
  		// A post entry.
 		var postData = {
    		body: body,
    		title: title,
    		time: time,
    		hashtag: hashtag
  		};

  		// Get a key for a new Post.
  		var newPostKey = firebase.database().ref().child('posts').push().key;

  		// Write the new post's data simultaneously in the posts list and the user's post list.
  		var updates = {};
  		updates['/posts/' + newPostKey] = postData;
  		return firebase.database().ref().update(updates);
	}

	function changePost(key,title, time, body,hashtag) {
  		// A post entry.
 		var postData = {
    		body: body,
    		title: title,
    		time: time,
    		hashtag: hashtag
  		};

  		var updates = {};
  		updates['/posts/' + key] = postData;
  		return firebase.database().ref().update(updates);
	}

	function recallAll(){
		var postdata = firebase.database().ref('posts/');
		postdata.on('child_added',function(data){
			mkPage(data.val().title,data.val().time,data.val().body,data.val().hashtag);
			count++;
			postdata.off();
		});

	}

});