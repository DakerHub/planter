(function($){
    $.fn.tree = function(option){
        var defaultOpt = {
            fold: true,
            foldAllChildren: false,
            openAllChildren:　false,
            activeEffect: true,
            customClass: "",
            cancelFocus: true
        },
        opt = $.extend({},defaultOpt,option),
        $this = this,
        util = {
            data: opt.data,
            level: 0,
            render:　function(){
                var htmlStr = traversal(util.data,1);
                $this.append($("<div id='jQuery-tree-wrapper'>"+htmlStr+"</div>"));
                /**
                 * 遍历数组，将数值中每个元素作为节点构成一个ul字符串返回
                 * @param {Array} arr 需要遍历的数组
                 * @param {Number} lv 节点层级
                 */
                function traversal(arr,lv){
                    var htmlStr = "<ul class='tree-node-list tree-lv"+lv+"'>";
                    for(var i =0;i<arr.length;i++){
                        htmlStr += "<li>";
                        htmlStr += "<div class='operation'>";
                        if(Array.isArray(arr[i].children) && arr[i].children.length>0 && opt.fold){
                           htmlStr += "<div class='folder'></div>"; 
                        }else{
                           htmlStr += "<div class='no-folder'></div>"; 
                        }
                        htmlStr += "</div><div class='tree-node-name' data-level='"+lv+"' data-id='"+(arr[i].id||0)+"'>"+arr[i].name+"</div>";
                        if(Array.isArray(arr[i].children) && arr[i].children.length>0){
                            htmlStr += arguments.callee(arr[i].children,lv+1);
                        }
                        htmlStr += "</li>";
                    }
                    htmlStr += "</ul>";
                    if(lv > util.level){
                        util.level = lv;
                    }
                    return htmlStr;
                }
            },
            fold: function(){
                for(var i=2;i<util.level+1;i++){
                    $(".tree-lv"+i).hide();
                }
            },
            bindEvent: function(){
                // 折叠事件，根据opt确定折叠打开方式
                $("#jQuery-tree-wrapper").on("click",".folder",function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    var $ul = $this.parent().nextAll("ul");
                    if($ul.css("display") == "none"){
                        $ul.show();
                        $this.addClass("open");
                        if(opt.openAllChildren){
                            $ul.find(".tree-node-list").each(function(){
                                $(this).show();
                            });
                            $ul.find(".folder").addClass("open");
                        }
                    }else{
                        $ul.hide();
                        $this.removeClass("open");
                        if(opt.foldAllChildren){
                            $ul.find(".tree-node-list").each(function(){
                                $(this).hide();
                            });
                            $ul.find(".open").removeClass("open");
                        }
                    }
                }).on("click",".tree-node-name",function(e){
                    e.stopPropagation();
                    var $this = $(this),
                    text = $this.text(),
                    id = $this.data("id"),
                    level = $this.data("level"),
                    local = [{
                        name: text,
                        id: id,
                        level:　level
                    }],
                    $parents = $this.parentsUntil(".tree-lv1",".tree-node-list"),
                    $nodeName = $parents.prev();
                    $("#jQuery-tree-wrapper .tree-active").removeClass("tree-active");//初始化效果类
                    $nodeName.each(function(){//获取点击项目的父项目的属性以及设置效果类
                        var $this = $(this);
                        local.push({
                            name: $this.text(),
                            id:　$this.data("id"),
                            level: $this.data("level")
                        });
                        // 为点击项目的父项目添加效果类
                        if(opt.activeEffect){
                            $this.addClass("tree-active");
                        }
                    });
                    
                    if(opt.activeEffect){// 为点击项目添加效果类
                        $this.addClass("tree-active "+opt.customClass);
                    }
                    
                    // 自定义列表点击事件
                    if(opt.itemClick && typeof opt.itemClick == "function"){
                        opt.itemClick.call($this,{
                            name:　text,
                            id: id,
                            level: level,
                            location: local,
                            $parendNode: $nodeName
                        });
                    }
                });
                if(opt.cancelFocus){
                    $("#jQuery-tree-wrapper").on("click",function(){
                        $(".tree-active").removeClass("tree-active");
                    });
                }
            },
            addChild: function(name,parentName,data){
                var htmlStr = "";
                if(parentName == "#"){
                    htmlStr += "<li>";
                    htmlStr += "<div class='operation'><div class='no-folder'></div></div>";
                    htmlStr += "<div class='tree-node-name' data-level='"+1+"' data-id='"+(data.id||0)+"'>"+name+"</div>";
                    htmlStr += "</li>";
                    $("#jQuery-tree-wrapper .tree-lv1").append($(htmlStr));
                }else{
                    var $nodeName = $(".tree-node-name");
                    $nodeName.each(function(){
                        var $parent = $(this);
                        if($parent.text() == parentName){
                            var level = parseInt($parent.data("level"));
                            // 判断父项原来是否有子项
                            if($parent.nextAll("ul").length > 0){
                                //有子项
                                htmlStr += "<li>";
                                htmlStr += "<div class='operation'><div class='no-folder'></div></div>";
                                htmlStr += "<div class='tree-node-name' data-level='"+(level+1)+"' data-id='"+(data.id||0)+"'>"+name+"</div>";
                                htmlStr += "</li>";
                                $parent.nextAll("ul").append($(htmlStr));
                            }else{
                                //无子项
                                htmlStr += "<ul class='tree-node-list tree-lv"+(level+1)+"'>";
                                htmlStr += "<li>";
                                htmlStr += "<div class='operation'><div class='no-folder'></div></div>";
                                htmlStr += "<div class='tree-node-name' data-level='"+(level+1)+"' data-id='"+(data.id||0)+"'>"+name+"</div>";
                                htmlStr += "</li>";
                                htmlStr += "</ul>";
                                $parent.after($(htmlStr));
                                $parent.prev().find(".no-folder").removeClass("no-folder").addClass("folder open");
                            }
                        }
                    });
                }
                 
            },
            removeChild: function(name){
                var $nodeName = $(".tree-node-name");
                $nodeName.each(function(){
                    var $this = $(this);
                    if($this.text() == name){
                        var $parentLi = $this.parent();
                        console.log($parentLi.siblings().length);
                        if($parentLi.siblings().length <= 0){
                            $parentLi.parent().prevAll(".operation").find(".folder").removeClass("open folder").addClass("no-folder");
                            $parentLi.parent().detach();
                        }else{
                            $parentLi.detach();
                        }
                    }
                });
            }
        };
        this.each(function(){
            util.render();
            if(opt.fold === true){
                util.fold();
            };
            util.bindEvent();
        });
        return {
            addChild: util.addChild,
            removeChild: util.removeChild
        };
    }
})(jQuery)