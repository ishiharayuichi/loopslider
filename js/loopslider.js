// loopslider.js 0.9.1.150210a
// (c) 2015 yuichi ishihara (UNIZONBEX)






$.fn.loopslider = function( options_ )
{
	var setting = {
		container_id    :'',
		target          :'<div id="images"></div>',
		next            :'<div id="next"></div>',
		prev            :'<div id="prev"></div>',
		images          :[],
		image_width     :300,
		auto_slide_time :5000,
		anime_slide_time:300
	};
	
	var $container;
	var $prev;
	var $next;
	var $images;
	var $list;
	var $circles;
	var defaultList = [];
	var loopList = [];
	var index;
	var defaultIndex = 0; //ループしていない状態でのフォーカスがあたっているアイテムのindex値
	var direction;
	var imageW;
	var distance;
	var size;
	var pause;
	var timer;
	var loopNum = 0;
	var listChildElement   = 'li';
	var circleChildElement = 'li';
	var imageListX = 0;
	
	
	
	
	function start()
	{
		// 引数の設定をマージする
		setting = $.extend( setting, options_ );
		
		
		// 必要変数への代入と、必要部品の生成
		$container  = $( setting.container_id );
		$prev       = $( setting.prev ).appendTo( $container );
		$next       = $( setting.next ).appendTo( $container );
		$images     = $container.append( $( setting.target ).append( '<ul id="list"></div>' ) );
		$list       = $container.find( '#list' );
		$circles    = $('<ul id="circles"></ul>').appendTo( $container );
		defaultList = setting.images;
		direction   = 0;
		imageW      = setting.image_width;
		distance    = 0;
		size        = imageW + distance;
		pause       = false; //loop関数に対してのポーズフラグ
		
		
		
		
		// 画像のcss
		$images.css({
			'width':imageW + distance + 'px',
			'margin':'0 auto'
		});
		
		
		
		$container.hide().fadeIn( 500 );
		$container.hover( function(){ pause = true }, function(){ pause = false } );
		$prev.click( function(){ onClick( -1, this ) } );
		$next.click( function(){ onClick( 1, this ) } );
		$prev.hover( function(){ onOver( this ) }, function(){ onOut( this ) } );
		$next.hover( function(){ onOver( this ) }, function(){ onOut( this ) } );
		setBtn();
		
		
		
		
		var clearTimer = false;
		$(window).resize( function()
		{
			pause = true;
			if(clearTimer !== false) clearTimeout(clearTimer);
			
			clearTimer = setTimeout( function()
			{
				pause = false;
				onResize();
				
			}, 200);
		});
		
		
		
		onResize();
	}




	function onResize()
	{
		// 空に
		$list.empty();
		$circles.empty();
		loopList = [];
		
		//最低でも2回はループするように
		loopNum = Math.ceil( $(window).width() / ( imageW * defaultList.length ) ) + 2;
		
		//必ず奇数回ループするように
		while( loopNum % 2 == 0 ) loopNum += 1;
		
		//ループさせる分、リストをつなげる
		for( var i=0; i<loopNum; i++ ) loopList = loopList.concat( defaultList );
		
		//初期値は真ん中一番最初のものに
		index = defaultList.length * Math.floor( loopNum/2 ) - 1 + defaultIndex;
		
		
		
		// スライド画像を生成
		for( i=0; i<loopList.length; i++ )
		{
			var dataIndexStr = 'data-index=' + i%defaultList.length;
		
			if( loopList[ i ].url )
			{
				$list.append( '<' + listChildElement + ' style="text-align:center; display:inline-block; width:' + size + 'px;"' + dataIndexStr + '><a href="' + loopList[ i ].url + '" style="width:' + size + 'px;"><img src="' + loopList[ i ].img + '" width=' + imageW + 'px /></a></' + listChildElement + '>' );
			}
			else
			{
				$list.append( '<' + listChildElement + ' style="text-align:center; display:inline-block; width:' + size + 'px;"' + dataIndexStr + '><img src="' + loopList[ i ].img + '" width=' + imageW + 'px /></' + listChildElement + '>' );
			}
		}
		
		// スライド画像（ユニークなもの）と一致する丸を生成
		for( i=0; i<defaultList.length; i++ )
		{
			var circle = $( '<' + circleChildElement + ' data-index=' + i + '></' + circleChildElement + '>' ).appendTo( $circles );
			
			circle.click( function()
			{
				var circleIndex = $(this).data( 'index' );
				var itemIndex   = 0;
				var length      = $list.find( listChildElement ).length;
				
				for( var j=index; j<length; j++ )
				{
					if( circleIndex == $list.find( listChildElement ).eq( j ).data( 'index' ) )
					{
						itemIndex = j;
						break;
					}
				}
				onClick( itemIndex - index, $(this) );
			});
			circle.hover( function(){ onOver( $(this) ) }, function(){ onOut( $(this) ) } );
		}
		
		
		$list.css({
			'padding':0,
			'width':loopList.length * size
		});
		
		slide(1);
	}





	// ◀ / ▶ が押された時の処理
	function onClick( direction_, target_ )
	{
		if( !$( target_ ).data( 'enabled' ) ) return;
		slide( direction_ );
	}
	function onOver( target_ )
	{
		if( !$( target_ ).data( 'enabled' ) ) return;
		$( target_ ).css( 'cursor', 'pointer' );
	}
	function onOut( target_ )
	{
		if( !$( target_ ).data( 'enabled' ) ) return;
		$( target_ ).css( 'cursor', 'default' );
	}
	function onEnabled( target_ )
	{
//		$( target_ ).animate({ "opacity":1.0 }, 50, "easeOutQuad" );
	}
	function onDisabled( target_ )
	{
//		$( target_ ).animate({ "opacity":0.5 }, 50, "easeOutQuad" );
	}
	
	
	
	
	
	
	// 一定時間でループする処理
	function loop()
	{
		timer = setTimeout( function()
		{
			if( pause )
			{
				loop();
				return;
			}
			
			slide( 1 );
		}, setting.auto_slide_time );
	}
	
	
	
	// 表示されている画像の位置の●を変更する
	function setCircles()
	{
		circleList = $circles.find( circleChildElement );
		
		for( var i=0; i<circleList.length; i++ )
		{
			setEnabled( circleList.eq( i ), true );
		}
		setEnabled( circleList.eq( defaultIndex ), false );
	}
	
	
	
	// 状況によるボタンの処理
	function setBtn()
	{
		setEnabled( $prev, loopList.length <= 1 ? false : true );
		setEnabled( $next, loopList.length <= 1 ? false : true );
	}
  
	function setEnabled( target_, value_ )
	{
		target_.data('enabled', value_);
		if( value_ ) onEnabled( target_ );
		else         onDisabled( target_ );
	}
	
	
	
	
	
	
	// 画像のスライド
	function slide( direction_ )
	{
		index += direction_;
		
		
		
		//移動前の処理/////////////
		onSlideStart();
		
		
		
		// 移動処理
		$list.transition({ x: -index * size + 'px' }, setting.anime_slide_time, 'easeInOutQuart', function()
		{
			// フォーカスされているアイテムと同じアイテムを、左右から削除する
			var removeStartIndex;//削除を開始するindex値
			var indexFixNum;     //左右から削除された後、indexが変わるための修正するindex値
			var nextX;           //左右から削除された後、座標が変わる。その修正座標
			if( direction_ > 0 )
			{
				removeStartIndex = index % defaultList.length;
				for( var i=0; i<=removeStartIndex; i++ )
				{
					$removeItem = $list.find( listChildElement ).eq( 0 );
					$removeItem.clone().appendTo($list);
					$removeItem.remove();
				}
				nextX = ( -index * size ) + size*(removeStartIndex+1);
				indexFixNum = -(removeStartIndex+1);
			}
			else
			{
				removeStartIndex = index + defaultList.length * Math.ceil( loopNum / 2);
				for( var i=$('#list li').length-1; i>=removeStartIndex; i-- )
				{
					$removeItem = $('#list li').eq( Math.floor( i ) );
					$removeItem.clone().prependTo($list);
					$removeItem.remove();
				}
				nextX = ( -index * size ) - size * ( $('#list li').length-removeStartIndex );
				indexFixNum = $('#list li').length-removeStartIndex;
			}
			
			
			//移動座標を再度調整
			imageListX = nextX;
			$list.transition({ x: nextX + 'px' }, 0 );
			
			//index値を調整
			index       += indexFixNum;
			defaultIndex = $list.find( listChildElement ).eq( index ).data( 'index' )
			
			
			
			//ループを再開
			loop();
			
			
			
			//移動終了時の処理 //////////////////
			onSlideEnd();
		});
	}
	
	
	
	//移動前の処理/////////////
	function onSlideStart()
	{
		// 時間でのループを停止
		clearTimeout( timer );
		
		// ボタンが効かないように
		setEnabled( $prev, false );
		setEnabled( $next, false );
		
		
		//移動前にすべてのアイテムを薄く
		$list.find( listChildElement ).each( function()
		{
			$(this).css({
				'opacity':'0.25',
				'pointer-events':'none'
			});
		});
	}
	
	
	
	//移動終了時の処理 //////////////////
	function onSlideEnd()
	{
		//フォーカスナビゲーションを設定
		setCircles();
		
		//左右ボタンを設定
		setBtn();
		
		//フォーカスがあたっているアイテムを明るく
		$list.find( listChildElement ).eq( index ).css({
			'pointer-events':'auto'
		}).transition({ opacity:1 }, 300, 'linear' );
	}
	
	
	start();
};
