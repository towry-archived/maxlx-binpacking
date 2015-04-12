/*!
 * Copyright (c) 2015 By Towry Wang
 * All rights reserved
 *
 * @license MIT License (http://towry.me/mit-license/)
 */

MaxlStrategy.makeStrategy('bin-packing', function () {
    this.onInit(function (ctx, scope) {
        scope.elements = ctx.elements;
        scope.container = typeof ctx.options.container === 'undefined' ? $(document.body) : $(ctx.options.container);
    })

    this.use(function (scope, next) {
        var container = scope.container;
        container.css('position', 'absolute');
        scope.cw = container.width();
        scope.ch = container.height();
        scope.root = new Node(scope.cw, scope.ch);
        // var offset = container.offset();
        // scope.offset = {x: offset.left, y: offset.top, width: container.width(), height: container.height()};
        next();
    })

    this.use(function (scope, next) {
        var items = scope.elements;
        var color;
        var item;
        var node;
        var border;
        var width, height;

        for (var i = 0, I = items.length; i < I; i++) {
            item = $(items[i]);
            border = (parseInt(item.css('border-width'), 10) || 0) * 2;
            width = item.width() + border;
            height = item.height() + border;
            node = scope.root.split(width, height);
            if (!node) {
                // miss it
                console.log('missed');
                continue;
            }

            color = getColor();

            item.css({
                'background-color': color,
                'position': 'absolute',
                'left': node.x(),
                'top': node.y()
            })
        }

        next();
    })

    function getColor () {
        var r = function () { var c = Math.floor(Math.random() * 255 + 0); return c.toString(16); }

        return "#" + r() + r() + r();
    }

    function Rect (w, h, x, y) {
        this.w = w;
        this.h = h;
        this.x = x || 0;
        this.y = y || 0;
        this.occupied = false;
    }

    Rect.prototype.toString = function () {
        return "<Rect " + this.x + ", " + this.y + ", " + this.w + ", " + this.h + ">";
    }

    function Node (width, height) {
        this.left = null;
        this.right = null;

        if (typeof width !== 'undefined' && typeof height !== 'undefined') {
            this.rect = new Rect(width, height);
        } else {
            this.rect = null;
        }

        this.size = 0;
    }

    Node.prototype.toString = function () {
        return "<Node " + this.rect.toString() + ">";
    }

    var node_keys = 'x y w h'.split(' ');
    for (var i = 0, I = node_keys.length; i < I; i++) {
        Object.defineProperty(Node.prototype, node_keys[i], {
            value: function (n) {
                return function () {
                    if (!this.rect) return -1;
                    return this.rect[node_keys[n]];
                }
            }.call(this, i),
            writtable: false
        })
    }

    /**
     * Is this node being used
     */
    Node.prototype.occupied = function () {
        return this.rect && this.rect.occupied;
    }

    /**
     * Mark this node as used
     */
    Node.prototype.occupy = function () {
        if (!this.rect) return;
        this.rect.occupied = true;
    }

    /**
     * Check if the block fit into this node
     */
    Node.prototype.fit = function (w, h) {
        if (Object.prototype.toString.call(w) == '[object Array]' && w.length == 2) {
            h = w[1];
            w = w[0];
        }

        if (this.rect.w === w && this.rect.h === h) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if this node is bigger than the block
     */
    Node.prototype.embrace = function (w, h) {
        if (Object.prototype.toString.call(w) == '[object Array]' && w.length == 2) {
            h = w[1];
            w = w[0];
        }

        if (!this.rect) return false;
        else if (this.rect.w >= w && this.rect.h >= h) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Split the node recursively
     */
    Node.prototype.split = function (w, h) {
        if (Object.prototype.toString.call(w) == '[object Array]' && w.length == 2) {
            h = w[1];
            w = w[0];
        }

        if (!this.rect) {
            throw new Error("No parent?");
        }

        if (this.occupied()) {
            return null;
        }
        if (!this.embrace(w, h)) {
            return null;
        }

        if (this.fit(w, h)) {
            this.occupy()
            return this;
        }

        // if not splited
        if (this.size === 0) {
            this.left = new Node();
            this.right = new Node();
            this.size += 2;

            if (this.rect.w - w > this.rect.h - h) {
                // left/right
                this.left.rect = new Rect(w, this.rect.h, this.rect.x, this.rect.y);
                this.right.rect = new Rect(this.rect.w - w, this.rect.h, this.rect.x + w, this.rect.y);
            } else {
                // top/down
                this.left.rect = new Rect(this.rect.w, h, this.rect.x, this.rect.y);
                this.right.rect = new Rect(this.rect.w, this.rect.h - h, this.rect.x, this.rect.y + h);
            }
        }

        var ok = this.left.split(w, h)

        if (!ok) {
            return this.right.split(w, h);
        } else {
            return ok;
        }
    }
})
