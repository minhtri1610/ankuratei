// FlickSlide v1.0.2// Copyright (c) 2011 Kosuke Araki - twitter�F@kaleido_kosuke// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php(function($){	$.fn.flickSlide=function(settings){		var strUA=navigator.userAgent.toLowerCase(),webkitUA=['iphone','android','ipad'],runiLayout=false,iLayoutLocation='',currentX=0,maxX=0,slideObj={},slideLock=1,slideTimer={},slideLotation={},slideDuration=0,slideCount=0,pagerMax=0,orientationChangeDelay=0;		var cpnno = $.query.get('cpn');		//alert(cpnno);		for(var i=0;i<webkitUA.length;i++){			if(strUA.indexOf(webkitUA[i],0)!=-1){				runiLayout=true;				if(webkitUA[i]==='android'){					orientationChangeDelay=400				}				if(webkitUA[i]==='iphone'){orientationChangeDelay=0}			}		}		if(runiLayout!==true){return;}		if(typeof $(this)===undefined||$(this).length===0){return;}		window.addEventListener("orientationchange",function(){			if(runiLayout!==true){return}			switch(window.orientation){				case 0:				orientationChangeCore();				break;				case 90:				orientationChangeCore();				break;				case -90:				orientationChangeCore();				break;			}		},false);		function orientationChangeCore(){			clearTimeout(slideTimer);			setTimeout(function(){				var styles=getComputedStyle($('.moveWrap').get(0));				if(styles){					$('.resizable').css('width',styles.width);					$('.slideMask').css('height',$('.move').outerHeight()).css('width',styles.width-1);					maxX=Number($('.flickSlideContainer li.slideUnit').length-1)*Number(styles.width.replace('px',''))*-1;					$('div.flickSlideContainer ul.move').get(0).style.webkitTransform='translate3d(0,0,0)';					currentX=0;					slideCount=0;					slidePager();					if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}				}else{}			},orientationChangeDelay);		}		function lotation(){			if(slideLock===0){				var slideUnitWidth=slideObj.children('li.slideUnit').outerWidth();				slideObj.get(0).style.webkitTransition='-webkit-transform 0.6s ease-out';				diffX=-151;				if(currentX===maxX){					slideObj.get(0).style.webkitTransform='translate3d(0, 0, 0)';					currentX=0;					slideCount=0;					slidePager();				}else{					currentX=currentX-slideUnitWidth;					slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';					slideCount++;slidePager();				}			}			slideLock=0;			if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}		}		function lotation_fast(){			if(slideLock===0){				var slideUnitWidth=slideObj.children('li.slideUnit').outerWidth();				slideObj.get(0).style.webkitTransition='-webkit-transform 0.2s ease-out';				diffX=-151;				if(currentX===maxX){					slideObj.get(0).style.webkitTransform='translate3d(0, 0, 0)';					currentX=0;					slideCount=0;					slidePager();				}else{					currentX=currentX-slideUnitWidth;					slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';					slideCount++;slidePager();				}			}			slideLock=0;			if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}		}		function slidePager(){			//var currentPager=$('.slidePagerPointer.active');			//var nextID='#pager'+String(slideCount);			//currentPager.removeClass('active');			//$(nextID).addClass('active');			switch(slideCount){				case 0:				$('.flickSlideBottom .bottomLeft').addClass('off');				$('.flickSlideBottom .bottomRight').removeClass('off');				break;				case pagerMax:				$('.flickSlideBottom .bottomRight').addClass('off');				$('.flickSlideBottom .bottomLeft').removeClass('off');				break;				default:				$('.flickSlideBottom .bottomLeft').removeClass('off');				$('.flickSlideBottom .bottomRight').removeClass('off');				break;			}		}		$.fn.slideButton=function(settings){			var settings=$.extend({direction:'prev',widthSource:{}},settings);			var self=$(this);			self.click(function(){				var slideUnitWidth=settings.widthSource.outerWidth();				slideLock=1;				clearTimeout(slideTimer);				slideObj.get(0).style.webkitTransition='-webkit-transform 0.6s ease-out';				if(settings.direction==='prev'){					if(currentX==0){						slideObj.get(0).style.webkitTransform='translate3d(0, 0, 0)';						if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}						slideLock=0;					}else{						currentX=currentX+slideUnitWidth;						slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';						slideCount--;						slidePager();						if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}						slideLock=0;					}				}else if(settings.direction==='next'){					if(currentX===maxX){						slideObj.get(0).style.webkitTransform='translate3d('+maxX+'px, 0, 0)';						if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}						slideLock=0;					}else{						currentX=currentX-slideUnitWidth;						slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';						slideCount++;slidePager();						if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}						slideLock=0;					}				}			});		}		$.fn.directButton=function(settings){						var settings=$.extend({page:0,widthSource:{}},settings);			var self=$(this);			self.click(function(){				alert('event detect');				//slidecount=settings.page;				var jdiff = 1;				var emx = 0;				if(slidecount > settings.page)jdiff=-1;								var slideUnitWidth=settings.widthSource.outerWidth();				slideLock=1;				clearTimeout(slideTimer);								slideObj.get(0).style.webkitTransition='-webkit-transform 0.3s ease-out';				for(var i=slidecount;i != settings.page ;i+=jdiff){					if(jdiff < 0){						if(currentX==0){							slideObj.get(0).style.webkitTransform='translate3d(0, 0, 0)';							if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}							slideLock=0;						}else{							currentX=currentX+slideUnitWidth;							slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';							slideCount--;							slidePager();							if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}							slideLock=0;						}					}else if(jdiff >0){						if(currentX===maxX){							slideObj.get(0).style.webkitTransform='translate3d('+maxX+'px, 0, 0)';							if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}							slideLock=0;						}else{							currentX=currentX-slideUnitWidth;							slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';							slideCount++;slidePager();							if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}							slideLock=0;						}					}					emx++;					if(emx > 20){						alert("loop exceeded");						break;					}				}			});		}		$.fn.touchDrag=function(settings){			var settings=$.extend({slideDuration:0},settings);			slideObj=$(this);			slideDuration=settings.slideDuration;			slideObj.bind('touchstart',{type:'start'},touchHandler);			slideObj.bind('touchmove',{type:'move'},touchHandler);			slideObj.bind('touchend',{type:'end'},touchHandler);			function touchHandler(e){				var slideUnitWidth=slideObj.children('li.slideUnit').outerWidth();				var touch=e.originalEvent.touches[0];				if(e.type=="touchstart"){					clearTimeout(slideTimer);					startX=touch.pageX;					startY=touch.pageY;					startTime=(new Date()).getTime();				}else if(e.type=="touchmove"){					diffX=touch.pageX-startX;					diffY=touch.pageY-startY;					if(Math.abs(diffX)-Math.abs(diffY)>0){						e.preventDefault();						moveX=Number(currentX+diffX);						slideObj.css('-webkit-transition','none');						slideObj.get(0).style.webkitTransform='translate3d( '+moveX+'px, 0, 0)';					}else if(diffY<-170){						location.href = "lists.html";					}				}else if(e.type=="touchend"){					var endTime=(new Date()).getTime();					var diffTime=endTime-startTime;					if(diffTime<300){						slideObj.get(0).style.webkitTransition='-webkit-transform 0.5s ease-out';					}else{						slideObj.get(0).style.webkitTransition='-webkit-transform 0.6s ease-out';					}					if(diffX>150||(diffX>60&&diffTime<400&&orientationChangeDelay===0)){						if(currentX==0){							slideObj.get(0).style.webkitTransform='translate3d(0, 0, 0)';						}else{							currentX=currentX+slideUnitWidth;							slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';							slideCount--;							slidePager();						}					}else if(diffX<-150||(diffX<-60&&diffTime<400&&orientationChangeDelay===0)){						if(currentX===maxX){							slideObj.get(0).style.webkitTransform='translate3d('+maxX+'px, 0, 0)';						}else{							currentX=currentX-slideUnitWidth;							slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';							slideCount++;							slidePager();						}					}else{						if(currentX===0){							slideObj.get(0).style.webkitTransform='translate3d(0, 0, 0)';						}else if(currentX===maxX){							slideObj.get(0).style.webkitTransform='translate3d('+maxX+'px, 0, 0)';						}else{							slideObj.get(0).style.webkitTransform='translate3d('+currentX+'px, 0, 0)';						}					}					if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}					slideLock=0;				}			}			if(slideDuration>0){slideTimer=setTimeout(lotation,slideDuration);}		}		var settings=$.extend({target:'',colum:1,height:170,duration:4000},settings);		var contents=$(this);		var contentsLength=contents.length;		var wrap=$('<div class="flickSlideContainer"><div class="moveWrap"><ul class="move"></ul></div></div>');		var slideMask=$('<div class="slideMask resizable"></div>');		//var bottom=$('<div class="flickSlideBottom"><div class="bottomLeft off"></div><ul class="slidePager"></ul><div class="bottomRight"></div></div>');		var bottom=$('<div class="flickSlideBottom"><div class="bottomLeft off"></div><div class="bottomCenter" onclick="jumpList()"></div><div class="bottomRight"></div></div>');		$(this).contents().find('img').removeAttr('width').removeAttr('height').css({width:'80%',height:'auto'});		var loop=Math.floor(contentsLength/settings.colum);		loop=contentsLength%settings.colum>0?loop++:loop;		pagerMax=loop-1;		var contentsCount=0;		/*		*/		for(var i=0;i<loop;i++){			var unitElem=$('<li/>').addClass('slideUnit').addClass('resizable');			var pager=$('<li id="pager'+i+'" class="slidePagerPointer"></li>');			if(i===0){pager.addClass('active')}			for(var j=0;j<settings.colum;j++){				var itemElem=$('<div/>');				if(typeof contents[contentsCount]!==undefined){itemElem.append($(contents[contentsCount]).children());}				unitElem.append(itemElem);contentsCount++;			}			wrap.contents().find('ul.move').append(unitElem);			//bottom.children('ul.slidePager').append(pager);			//bottom.children('#pager' + i).directButton({page:i,widthSource:wrap.contents().find('li.slideUnit')});		}		$(settings.target).after(wrap);		$(settings.target).remove();		bottom.children('.bottomLeft').slideButton({direction:'prev',widthSource:wrap.contents().find('li.slideUnit')});		bottom.children('.bottomRight').slideButton({direction:'next',widthSource:wrap.contents().find('li.slideUnit')});		wrap.contents().find('ul.move').touchDrag({duration:settings.duration});		wrap.after(bottom);		$(window).bind('load',function(){			var styles=getComputedStyle($('.moveWrap').get(0));			if(styles){				$('.resizable').css('width',styles.width);				$('.slideMask').css('height',$('.move').outerHeight()).css('width',styles.width-1);				maxX=Number($('.flickSlideContainer li.slideUnit').length-1)*Number(styles.width.replace('px',''))*-1;			}			var slideFirstChild=$('ul.move li:first').clone();			$('ul.move').show();			for(var i=0 ; i<=cpnno;i++){				lotation_fast();			}		});	}})(jQuery);var is={ie:navigator.appName=='Microsoft Internet Explorer',java:navigator.javaEnabled(),ns:navigator.appName=='Netscape',ua:navigator.userAgent.toLowerCase(),version:parseFloat(navigator.appVersion.substr(21))||parseFloat(navigator.appVersion),win:navigator.platform=='Win32'}is.mac=is.ua.indexOf('mac')>=0;if(is.ua.indexOf('opera')>=0){is.ie=is.ns=false;is.opera=true;}if(is.ua.indexOf('gecko')>=0){is.ie=is.ns=false;is.gecko=true;}