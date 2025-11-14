// 人生倒计时功能核心逻辑
// 所有代码仅作用于 #section3，不影响其他section

(function() {
  'use strict';

  // ============================================
  // 1. 数据管理模块
  // ============================================

  class DataManager {
    constructor() {
      this.storageKey = 'lifeCountdownData';
    }

    loadData() {
      // 临时清除 localStorage 中的旧数据，确保使用默认数据
      // TODO: 部署后可以移除这行，恢复正常的 localStorage 逻辑
      const shouldUseDefault = true; // 设置为 true 强制使用默认数据
      
      if (!shouldUseDefault) {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            data.isDefault = false;
            return data;
          } catch (e) {
            console.error('加载数据失败:', e);
          }
        }
      }
      
      // 返回默认数据
      if (typeof LIFE_COUNTDOWN_DEFAULT_DATA !== 'undefined') {
        return { ...LIFE_COUNTDOWN_DEFAULT_DATA };
      }
      return this.getEmptyData();
    }

    saveData(data) {
      if (data.isDefault) {
        // 默认数据不保存
        return;
      }
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {
        console.error('保存数据失败:', e);
      }
    }

    resetToDefault() {
      localStorage.removeItem(this.storageKey);
      if (typeof LIFE_COUNTDOWN_DEFAULT_DATA !== 'undefined') {
        return { ...LIFE_COUNTDOWN_DEFAULT_DATA };
      }
      return this.getEmptyData();
    }

    getEmptyData() {
      return {
        birthDate: new Date().toISOString().split('T')[0],
        expectedLifespan: 80,
        activities: [],
        majorEvents: [],
        todoList: [],
        isDefault: false,
        lastModified: new Date().toISOString()
      };
    }
  }

  // ============================================
  // 2. 日期计算模块
  // ============================================

  class DateCalculator {
    // 计算年龄（从出生日期到现在）
    calculateAge(birthDate) {
      const birth = new Date(birthDate);
      const now = new Date();
      
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      
      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // 计算总月份数（所有存在过的月份）
      const totalMonths = years * 12 + months;
      
      // 计算总天数
      const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(totalDays / 7);
      const hours = totalDays * 24 + now.getHours() - birth.getHours();
      const minutes = hours * 60 + now.getMinutes() - birth.getMinutes();
      
      return {
        years,
        months: totalMonths, // 返回总月份数
        weeks,
        days: totalDays,
        hours,
        minutes
      };
    }

    // 计算剩余时间（从现在到死亡日期）
    calculateRemaining(birthDate, lifespan, deathMonth, deathDay) {
      const birth = new Date(birthDate);
      const deathYear = birth.getFullYear() + lifespan;
      const death = new Date(deathYear, deathMonth - 1, deathDay);
      const now = new Date();
      
      if (death <= now) {
        return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0 };
      }
      
      let years = death.getFullYear() - now.getFullYear();
      let months = death.getMonth() - now.getMonth();
      let days = death.getDate() - now.getDate();
      
      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        days += lastMonth.getDate();
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // 计算总月份数（剩余的所有月份）
      const totalMonths = years * 12 + months;
      
      // 计算总天数
      const totalDays = Math.floor((death - now) / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(totalDays / 7);
      const hours = totalDays * 24;
      const minutes = hours * 60;
      
      return {
        years,
        months: totalMonths, // 返回总月份数
        weeks,
        days: totalDays,
        hours,
        minutes
      };
    }

    // 计算死亡日期
    calculateDeathDate(birthDate, lifespan, month, day) {
      const birth = new Date(birthDate);
      const deathYear = birth.getFullYear() + lifespan;
      return new Date(deathYear, month - 1, day);
    }

    // 计算已过去的周数
    calculatePassedWeeks(birthDate) {
      const birth = new Date(birthDate);
      const now = new Date();
      const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
      return Math.floor(days / 7);
    }

    // 计算剩余周数
    calculateRemainingWeeks(birthDate, lifespan, deathMonth, deathDay) {
      const birth = new Date(birthDate);
      const deathYear = birth.getFullYear() + lifespan;
      const death = new Date(deathYear, deathMonth - 1, deathDay);
      const now = new Date();
      const days = Math.floor((death - now) / (1000 * 60 * 60 * 24));
      return Math.max(0, Math.floor(days / 7));
    }
  }

  // ============================================
  // 3. 活动计算模块
  // ============================================

  class ActivityCalculator {
    calculateActivity(activity, remainingTime) {
      const { frequency, duration, durationUnit = 'hour' } = activity;
      const { value, unit } = frequency;
      
      let times = 0;
      let totalHours = 0;
      
      // 计算次数
      if (unit === 'day') {
        times = remainingTime.days / value;
      } else if (unit === 'week') {
        times = remainingTime.weeks / value;
      } else if (unit === 'month') {
        times = remainingTime.months / value;
      } else if (unit === 'year') {
        times = remainingTime.years / value;
      }
      
      // 将持续时间转换为小时
      let durationInHours = duration;
      if (durationUnit === 'second') {
        durationInHours = duration / 3600;
      } else if (durationUnit === 'minute') {
        durationInHours = duration / 60;
      } else if (durationUnit === 'hour') {
        durationInHours = duration;
      } else if (durationUnit === 'day') {
        durationInHours = duration * 24;
      } else if (durationUnit === 'week') {
        durationInHours = duration * 24 * 7;
      } else if (durationUnit === 'month') {
        durationInHours = duration * 24 * 30; // 简化：每月30天
      }
      
      totalHours = times * durationInHours;
      
      return {
        times: Math.floor(times),
        totalHours: Math.floor(totalHours)
      };
    }
  }

  // ============================================
  // 4. Canvas绘制模块 - 生命周图
  // ============================================

  class WeekChartRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = {
        squareSize: 8,
        spacing: 2,
        squaresPerColumn: 26,
        columnsPerYear: 2,
        borderColor: '#0000FF',
        blackColor: '#000000',
        whiteColor: '#FFFFFF',
        whiteBorder: 1,
        decadeMarkerColor: '#FF0000'
      };
    }

    calculateColumns(totalWeeks) {
      return Math.ceil(totalWeeks / this.options.squaresPerColumn);
    }

    drawSquare(x, y, isBlack) {
      const { squareSize, spacing, whiteBorder } = this.options;
      const actualX = x * (squareSize + spacing);
      const actualY = y * (squareSize + spacing) + 10; // +10为标记预留空间
      
      if (isBlack) {
        this.ctx.fillStyle = this.options.blackColor;
        this.ctx.fillRect(actualX, actualY, squareSize, squareSize);
      } else {
        this.ctx.fillStyle = this.options.whiteColor;
        this.ctx.fillRect(actualX, actualY, squareSize, squareSize);
        
        // 内描边（1px inside）
        this.ctx.strokeStyle = this.options.blackColor;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
          actualX + 0.5,
          actualY + 0.5,
          squareSize - 1,
          squareSize - 1
        );
      }
    }

    drawDecadeMarker(columnIndex) {
      const { squareSize, spacing } = this.options;
      const x = columnIndex * (squareSize + spacing) + squareSize / 2;
      const y = 5;
      
      this.ctx.fillStyle = this.options.decadeMarkerColor;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    render(passedWeeks, remainingWeeks) {
      const totalWeeks = passedWeeks + remainingWeeks;
      const totalColumns = this.calculateColumns(totalWeeks);
      
      const { squareSize, spacing, squaresPerColumn } = this.options;
      const columnWidth = squareSize + spacing;
      const rowHeight = squareSize + spacing;
      
      this.canvas.width = totalColumns * columnWidth;
      this.canvas.height = squaresPerColumn * rowHeight + 10;
      
      // 清空画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 绘制方块（已移除蓝色边框）
      let weekIndex = 0;
      for (let col = 0; col < totalColumns; col++) {
        for (let row = 0; row < squaresPerColumn; row++) {
          if (weekIndex < totalWeeks) {
            const isBlack = weekIndex < passedWeeks;
            this.drawSquare(col, row, isBlack);
            weekIndex++;
          }
        }
        
        // 每10年绘制红色标记（每20列 = 10年）
        if (col % 20 === 0 && col > 0) {
          this.drawDecadeMarker(col);
        }
      }
      
      // 第一个标记
      this.drawDecadeMarker(0);
    }
  }

  // ============================================
  // 5. Canvas绘制模块 - 生命阶段图（基于 Figma 设计）
  // ============================================

  class LifeStageRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      
      // 生命阶段定义
      this.stages = [
        { name: "婴儿期", min: 0, max: 1 },
        { name: "幼儿期", min: 1, max: 3 },
        { name: "学前期", min: 3, max: 6 },
        { name: "儿童期", min: 6, max: 12 },
        { name: "青少年期", min: 12, max: 18 },
        { name: "初成年期", min: 18, max: 25 },
        { name: "成年期", min: 25, max: 40 },
        { name: "中年期", min: 40, max: 65 },
        { name: "老年期", min: 65, max: Infinity }
      ];
      
      // Figma 设计规范（从设计提取，放大1.2倍）
      const scale = 1.2; // 整体放大倍数
      const contentOffsetY = Math.round(20 * scale); // 内容向下偏移（24px）
      this.design = {
        yearWidth: Math.round(72 * scale),           // 每个时间点宽度（86px）
        timelineY: Math.round(122 * scale) + contentOffsetY,         // 时间轴 Y 位置（170px）
        stageLabelY: Math.round(40 * scale) + contentOffsetY,        // 生命阶段标签 Y 位置（72px）
        stageLineY: Math.round(60 * scale) + contentOffsetY,         // 阶段横连线 Y 位置（96px）
        dotSize: Math.round(10 * scale),            // 黑色小方块尺寸（12px）
        gap: Math.round(6 * scale),                 // 垂直间距（7px）
        timelineBottomGap: Math.round(12 * scale),  // 时间轴下方与年份之间的额外间距（14px）
        fontSize: {
          title: Math.round(16 * scale),            // 标题字体（19px）
          year: Math.round(12 * scale),             // 年份/年龄字体（14px）
          event: Math.round(12 * scale),            // 事件字体（14px）
          stage: Math.round(12 * scale)             // 阶段标签字体（14px）
        },
        colors: {
          black: '#000000',     // 黑色
          red: '#c41616',       // 红色（"现在"标记）
          gray: '#acacac',      // 灰色（编辑提示）
          lightGray: '#d0d0d0' // 浅灰色（短横线）
        },
        fontFamily: "'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" // 全局字体
      };
    }

    getStage(age) {
      return this.stages.find(s => age >= s.min && age < s.max);
    }

    calculateAge(birthDate, currentDate) {
      const birth = new Date(birthDate);
      const current = new Date(currentDate);
      let age = current.getFullYear() - birth.getFullYear();
      const monthDiff = current.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }

    render(birthDate, deathDate, majorEvents = [], isEditMode = false) {
      const birth = new Date(birthDate);
      const death = new Date(deathDate);
      const birthYear = birth.getFullYear();
      const deathYear = death.getFullYear();
      
      // 计算要显示的年数（从出生到死亡，延长显示）
      const yearsToShow = deathYear - birthYear;
      
      const { yearWidth, timelineY, stageLabelY, dotSize, gap, fontSize, colors, fontFamily } = this.design;
      const contentOffsetY = Math.round(20 * 1.2); // 内容向下偏移（24px）
      // 延长显示，确保最后一个时间点完整显示（多显示一个时间点的宽度）
      const canvasWidth = (yearsToShow + 1) * yearWidth;
      const canvasHeight = Math.round(312 * 1.2) + contentOffsetY; // 从 Figma: 312px，放大1.2倍并增加底部空间（398px）
      
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // 初始化位置数组
      this.eventTextPositions = [];
      this.buttonPositions = [];
      
      // 绘制容器边框（白色背景，黑色边框）
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      this.ctx.strokeStyle = colors.black;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
      
      // 绘制主时间轴（水平箭头线，位于 timelineY = 122px）
      this.ctx.strokeStyle = colors.black;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      // 延长时间轴，确保最后一个时间点完整显示
      this.ctx.moveTo(0, timelineY);
      this.ctx.lineTo(canvasWidth - Math.round(8 * 1.2), timelineY); // 留出箭头空间（放大1.2倍）
      this.ctx.stroke();
      
      // 绘制箭头（右侧）
      const arrowSize = Math.round(8 * 1.2); // 箭头尺寸（10px，放大1.2倍）
      this.ctx.beginPath();
      this.ctx.moveTo(canvasWidth, timelineY);
      this.ctx.lineTo(canvasWidth - arrowSize, timelineY - arrowSize / 2);
      this.ctx.lineTo(canvasWidth - arrowSize, timelineY + arrowSize / 2);
      this.ctx.closePath();
      this.ctx.fillStyle = colors.black;
      this.ctx.fill();
      
      // 计算并绘制生命阶段标签和分隔线
      const { stageLineY } = this.design;
      let currentStage = null;
      let stageStartX = 0;
      const stagePositions = [];
      const verticalLinePositions = []; // 存储所有竖线位置
      
      // 第一根竖线从0岁开始（第一个黑色方块中心）
      verticalLinePositions.push(yearWidth / 2);
      
      for (let i = 0; i <= yearsToShow; i++) {
        const age = i;
        const stage = this.getStage(age);
        
        if (stage && stage !== currentStage) {
          if (currentStage) {
            // 记录阶段分隔线位置（对齐到黑色方块中间）
            const x = i * yearWidth + yearWidth / 2;
            verticalLinePositions.push(x);
            
            // 记录阶段位置用于标签
            stagePositions.push({ 
              stage: currentStage, 
              startX: stageStartX, 
              endX: x,
              width: x - stageStartX
            });
          }
          currentStage = stage;
          // 如果是第一个阶段，从0岁方块中间开始；否则从当前方块中间开始
          if (stageStartX === 0) {
            stageStartX = yearWidth / 2;
          } else {
            stageStartX = i * yearWidth + yearWidth / 2;
          }
        }
      }
      
      // 记录最后一个阶段（到最后一个黑色方块中间）
      if (currentStage) {
        const lastX = yearsToShow * yearWidth + yearWidth / 2;
        verticalLinePositions.push(lastX);
        stagePositions.push({ 
          stage: currentStage, 
          startX: stageStartX, 
          endX: lastX,
          width: lastX - stageStartX
        });
      }
      
      // 绘制竖线（从每个黑色方块中间向上延伸到横连线）
      this.ctx.strokeStyle = colors.lightGray; // 浅灰色
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([]); // 实线
      verticalLinePositions.forEach((x) => {
        this.ctx.beginPath();
        this.ctx.moveTo(x, timelineY); // 从时间轴开始
        this.ctx.lineTo(x, stageLineY); // 延伸到横连线
        this.ctx.stroke();
      });
      
      // 绘制横连线（连接所有竖线）
      if (verticalLinePositions.length > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(verticalLinePositions[0], stageLineY);
        this.ctx.lineTo(verticalLinePositions[verticalLinePositions.length - 1], stageLineY);
        this.ctx.stroke();
      }
      
      // 绘制阶段标签（在横连线上方，居中对齐）
      this.ctx.fillStyle = colors.black;
      this.ctx.font = `${fontSize.stage}px ${fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom'; // 底部对齐，让文字在横线上方
      stagePositions.forEach(({ stage, startX, width }) => {
        const labelX = startX + width / 2; // 居中对齐
        this.ctx.fillText(stage.name, labelX, stageLineY - gap); // 在横线上方，留出间距
      });
      
        // 绘制时间点和事件
      for (let i = 0; i <= yearsToShow; i++) {
        const year = birthYear + i;
        const age = i;
        const x = i * yearWidth + yearWidth / 2; // 居中位置
        
        // 判断是否是死亡时间（最后一个时间点）
        const isDeathTime = (i === yearsToShow);
        
        // 绘制小方块（在时间轴上方，10px × 10px）
        // 死亡时间用红色，其他用黑色
        this.ctx.fillStyle = isDeathTime ? colors.red : colors.black;
        this.ctx.fillRect(x - dotSize / 2, timelineY - dotSize / 2, dotSize, dotSize);
        
        // 绘制年份和年龄（在时间轴下方，增加间距）
        const { timelineBottomGap } = this.design;
        this.ctx.fillStyle = colors.black;
        this.ctx.font = `${fontSize.year}px ${fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`${year}年`, x, timelineY + timelineBottomGap);
        this.ctx.fillText(`${age}岁`, x, timelineY + timelineBottomGap + fontSize.year + gap);
        
        // 绘制短横线（在年龄下方）
        const lineStartY = timelineY + timelineBottomGap + fontSize.year + gap + fontSize.year + gap;
        const lineLength = Math.round(40 * 1.2); // 短横线长度（48px，放大1.2倍）
        this.ctx.strokeStyle = colors.lightGray; // 浅灰色
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - lineLength / 2, lineStartY);
        this.ctx.lineTo(x + lineLength / 2, lineStartY);
        this.ctx.stroke();
        
        // 绘制重大事件（在短横线下方，居中对齐，最多6个）
        const eventStartY = lineStartY + gap;
        const eventsForThisYear = majorEvents ? majorEvents.filter(e => e.age === age) : [];
        
        let currentY = eventStartY;
        let eventList = [];
        
        if (eventsForThisYear.length > 0) {
          this.ctx.fillStyle = colors.black;
          this.ctx.font = `${fontSize.event}px ${fontFamily}`;
          this.ctx.textAlign = 'center'; // 居中对齐
          this.ctx.textBaseline = 'top';
          
          // 获取该年龄的所有事件（最多6个）
          const eventData = eventsForThisYear[0];
          eventList = (eventData.events || []).slice(0, 6); // 最多6个
          
          eventList.forEach((eventText, eventIdx) => {
            if (eventText) {
              // 处理文本换行（如果超过72px宽度，需要换行）
              const maxWidth = yearWidth - 4; // 留出一些边距
              const words = eventText.split('');
              let line = '';
              let lines = [];
              
              // 简单的换行逻辑：按字符分割，每行不超过最大宽度
              for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i];
                const metrics = this.ctx.measureText(testLine);
                if (metrics.width > maxWidth && line.length > 0) {
                  lines.push(line);
                  line = words[i];
                } else {
                  line = testLine;
                }
              }
              if (line.length > 0) {
                lines.push(line);
              }
              
              // 如果没有换行，直接显示
              if (lines.length === 0) {
                lines = [eventText];
              }
              
              // 记录文本位置，用于点击编辑
              const textStartY = currentY;
              const textHeight = lines.length * (fontSize.event + gap) - gap;
              
              // 绘制每一行（居中）
              lines.forEach((line, lineIdx) => {
                this.ctx.fillText(line, x, currentY);
                currentY += fontSize.event + gap;
              });
              
              // 记录文本区域位置（用于点击检测）
              this.eventTextPositions.push({
                age,
                year: birthYear + age,
                eventIndex: eventIdx,
                text: eventText,
                x: x - yearWidth / 2,
                y: textStartY,
                width: yearWidth,
                height: textHeight
              });
            }
          });
        }
        
        // 存储按钮位置（在最后一个事件下方，或短横线下方）
        this.buttonPositions.push({
          age,
          year: birthYear + age,
          x,
          y: currentY, // 按钮位置在最后一个事件下方
          hasEvents: eventsForThisYear.length > 0 && eventList && eventList.length > 0
        });
      }
      
      // 绘制"现在"标记（红色竖线，贯穿整个容器，精确到月份）
      // 使用固定日期 2025-11-11，避免时差问题，全球用户看到一致的结果
      const fixedCurrentDate = new Date(2025, 10, 11); // 2025年11月11日（月份从0开始，所以10表示11月）
      
      // 计算当前年份和月份
      const currentYear = fixedCurrentDate.getFullYear(); // 2025
      const currentMonth = fixedCurrentDate.getMonth(); // 10 (11月，0-11)
      
      // 计算当前年份距离出生年份的年数
      const yearsFromBirth = currentYear - birthYear;
      
      // 计算在当前年份中的月份进度（0-1之间）
      // 11月 = 10，进度 = (10 + 1) / 12 = 11/12 ≈ 0.917
      const monthProgress = (currentMonth + 1) / 12;
      
      // 计算红色线的精确位置（对齐到刻度）
      // 如果年份在显示范围内
      if (yearsFromBirth >= 0 && yearsFromBirth <= yearsToShow) {
        // 计算红色线的X位置：对齐到刻度（黑色方块的中心位置）
        // 每个年份的刻度位置 = i * yearWidth + yearWidth / 2
        // 当前年份的刻度位置 + 月份进度偏移
        const currentYearTickX = yearsFromBirth * yearWidth + yearWidth / 2; // 当前年份刻度位置
        const nextYearTickX = (yearsFromBirth + 1) * yearWidth + yearWidth / 2; // 下一年份刻度位置
        
        // 在两个刻度之间根据月份进度插值
        const currentX = currentYearTickX + (nextYearTickX - currentYearTickX) * monthProgress;
        
        this.ctx.strokeStyle = colors.red;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, 0);
        this.ctx.lineTo(currentX, canvasHeight);
        this.ctx.stroke();
        
        // 绘制"现在"文字（在红线右边，垂直显示，红色）
        // 文字位置：红线右边，横连线上方，位置更高
        const textX = currentX + gap * 2; // 红线右边，留出间距
        const textY = stageLineY - gap * 9; // 横连线上方，位置更高
        this.ctx.save();
        this.ctx.translate(textX, textY);
        this.ctx.rotate(Math.PI / 2); // 旋转90度，垂直显示
        this.ctx.fillStyle = colors.red;
        this.ctx.font = `${fontSize.event}px ${fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle'; // 居中对齐
        this.ctx.fillText('现在', 0, 0);
        this.ctx.restore();
      }
      
      // 按钮位置已在绘制事件时存储到 this.buttonPositions
    }
    
    // 获取点击位置的年龄
    getAgeAtPosition(x, y) {
      if (!this.yearPositions) return null;
      
      const { yearWidth, timelineY, gap, fontSize } = this.design;
      const lineStartY = timelineY + gap + fontSize.year + gap + fontSize.year + gap;
      const eventStartY = lineStartY + gap;
      const buttonAreaHeight = 20; // 按钮区域高度
      
      for (const pos of this.yearPositions) {
        const buttonAreaLeft = pos.x - yearWidth / 2;
        const buttonAreaRight = pos.x + yearWidth / 2;
        const buttonAreaTop = eventStartY;
        const buttonAreaBottom = eventStartY + buttonAreaHeight;
        
        if (x >= buttonAreaLeft && x <= buttonAreaRight && 
            y >= buttonAreaTop && y <= buttonAreaBottom) {
          return pos;
        }
      }
      return null;
    }
  }

  // ============================================
  // 6. Canvas绘制模块 - 想做的事情表格
  // ============================================

  // ============================================
  // Notion 接口管理（占位，后期连接）
  // ============================================
  
  class NotionDataManager {
    constructor() {
      this.isEnabled = false; // 暂时禁用，等部署到服务器后启用
      this.apiEndpoint = '/api/notion/todos'; // 预留接口地址
    }
    
    // 从 Notion 获取数据（占位）
    async fetchFromNotion() {
      if (!this.isEnabled) {
        // 返回示例数据
        return this.getSampleData();
      }
      
      try {
        const response = await fetch(this.apiEndpoint);
        if (!response.ok) throw new Error('Notion API 请求失败');
        const data = await response.json();
        return data.todos || [];
      } catch (error) {
        console.error('从 Notion 获取数据失败:', error);
        return this.getSampleData();
      }
    }
    
    // 保存到 Notion（占位）
    async saveToNotion(todos) {
      if (!this.isEnabled) {
        console.log('Notion 接口未启用，数据仅保存到本地');
        return false;
      }
      
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todos })
        });
        return response.ok;
      } catch (error) {
        console.error('保存到 Notion 失败:', error);
        return false;
      }
    }
    
    // 生成示例数据
    getSampleData() {
      const baseWishes = [
        '写一本书', '环游世界', '学会一门新语言', '完成一次马拉松', '学习摄影',
        '学会做10道拿手菜', '去一次极地旅行', '学会弹钢琴', '写一个开源项目', '学会游泳',
        '去一次非洲', '学会画画', '完成一次跳伞', '学会编程', '去一次日本',
        '学会冲浪', '去一次南美洲', '学会做咖啡拉花', '完成一次徒步旅行', '学会打网球',
        '去一次冰岛看极光', '学会做面包', '完成一次骑行旅行', '学会滑板', '去一次新西兰',
        '学会做甜品', '完成一次登山', '学会做陶艺', '去一次西藏', '学会做手工',
        '完成一次潜水', '学会做木工', '去一次欧洲', '学会做花艺', '完成一次露营',
        '学会做瑜伽', '去一次东南亚', '学会做调酒', '完成一次自驾游', '学会做园艺',
        '去一次中东', '学会做刺绣', '完成一次攀岩', '学会做皮具', '去一次澳大利亚',
        '学会做珠宝', '完成一次漂流', '学会做香薰', '去一次加拿大', '学会做蜡烛',
        '完成一次滑雪', '学会做编织', '去一次俄罗斯', '学会做折纸', '完成一次滑翔',
        '学会做拼图', '去一次印度', '学会做模型', '完成一次蹦极', '学会做雕刻',
        '去一次土耳其', '学会做书法', '完成一次热气球', '学会做篆刻', '去一次希腊',
        '学会做茶艺', '完成一次滑翔伞', '学会做插花', '去一次意大利', '学会做烘焙',
        '完成一次跳伞', '学会做料理', '去一次西班牙', '学会做调香', '完成一次攀冰',
        '学会做园艺', '去一次葡萄牙', '学会做陶器', '完成一次冲浪', '学会做木雕',
        '去一次荷兰', '学会做石雕', '完成一次滑板', '学会做漆器', '去一次比利时',
        '学会做银器', '完成一次骑行', '学会做铜器', '去一次瑞士', '学会做玻璃',
        '完成一次徒步', '学会做陶瓷', '去一次奥地利', '学会做金属', '完成一次登山',
        '学会做纤维', '去一次捷克', '学会做纸艺', '完成一次潜水', '学会做布艺',
        '去一次波兰', '学会做皮革', '完成一次跳伞', '学会做竹艺', '去一次匈牙利',
        '学会做草编', '完成一次攀岩', '学会做藤编', '去一次罗马尼亚', '学会做绳编',
        '完成一次漂流', '学会做钩针', '去一次保加利亚', '学会做针织', '完成一次滑雪',
        '学会做缝纫', '去一次克罗地亚', '学会做刺绣', '完成一次滑翔', '学会做十字绣'
      ];
      
      // 生成102条数据
      const wishes = [];
      for (let i = 0; i < 102; i++) {
        const baseIndex = i % baseWishes.length;
        const repeatCount = Math.floor(i / baseWishes.length);
        let text = baseWishes[baseIndex];
        
        // 如果重复，添加序号区分
        if (repeatCount > 0) {
          text = `${text}（${repeatCount + 1}）`;
        }
        
        wishes.push({
          id: i + 1,
          text: text
        });
      }
      
      return wishes;
    }
  }

  class TodoTableRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = {
        columns: 3, // 默认三列，实际会根据内容动态计算
        rowHeight: 50, // 缩小单元格高度
        cellPadding: 8, // 右边距（增加文字末尾与右边单元格的距离）
        leftPadding: 12, // 左边距（序号与左边线的距离）
        borderColor: '#CCCCCC',
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        numberColor: '#666666',
        fontFamily: "'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 16, // 缩小字号
        numberFontSize: 14 // 缩小序号字号
      };
    }

    wrapText(text, maxWidth, maxLines) {
      const chars = text.split('');
      const lines = [];
      let currentLine = '';
      
      // 超过10个字符就换行
      const maxCharsPerLine = 10;
      
      for (let char of chars) {
        if (currentLine.length >= maxCharsPerLine) {
          lines.push(currentLine);
          currentLine = char;
          if (lines.length >= maxLines) break;
        } else {
          currentLine += char;
        }
      }
      
      if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
      }
      
      return lines;
    }

    // 计算单列的宽度（根据该列中最长的文字）
    calculateColumnWidth(columnItems) {
      let maxWidth = 0;
      const { fontSize, numberFontSize, fontFamily, cellPadding, leftPadding } = this.options;
      
      // 设置字体以测量文字宽度
      this.ctx.font = `${numberFontSize}px ${fontFamily}`;
      const numberText = '99.'; // 假设最大序号是两位数
      const numberWidth = this.ctx.measureText(numberText).width;
      
      this.ctx.font = `${fontSize}px ${fontFamily}`;
      const charWidth = this.ctx.measureText('中').width;
      
      for (let item of columnItems) {
        // 计算文本宽度（考虑换行，每行最多10字）
        const lines = this.wrapText(item.text, 0, 2);
        let textWidth = 0;
        for (let line of lines) {
          const lineWidth = line.length * charWidth;
          textWidth = Math.max(textWidth, lineWidth);
        }
        
        // 总宽度 = 左边距 + 序号宽度 + 间距 + 文本宽度 + 右边距
        const totalItemWidth = leftPadding + numberWidth + 4 + textWidth + cellPadding;
        maxWidth = Math.max(maxWidth, totalItemWidth);
      }
      
      return Math.max(maxWidth, 150); // 最小宽度150px
    }

    render(todoList) {
      if (!todoList || todoList.length === 0) {
        this.canvas.width = 600;
        this.canvas.height = 100;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#999999';
        this.ctx.font = `12px ${this.options.fontFamily}`;
        this.ctx.fillText('暂无想做的事情', 10, 30);
        return;
      }
      
      const { columns, rowHeight, borderColor, borderWidth, backgroundColor, textColor, numberColor, fontFamily, fontSize, numberFontSize, cellPadding, leftPadding } = this.options;
      
      // 计算需要的列数（每列最多10个条目，从上往下填充）
      const maxItemsPerColumn = 10;
      const totalColumns = Math.ceil(todoList.length / maxItemsPerColumn);
      const actualColumns = totalColumns; // 有多少条内容就显示多少列
      
      // 计算需要的行数（固定为10行，因为每列最多10个条目）
      const actualRows = maxItemsPerColumn;
      
      // 为每一列计算宽度（根据该列中最长的文字）
      const columnWidths = [];
      let totalCanvasWidth = borderWidth; // 左边框
      
      for (let col = 0; col < actualColumns; col++) {
        // 获取该列的所有条目
        const columnItems = [];
        for (let row = 0; row < actualRows; row++) {
          const itemIndex = col * maxItemsPerColumn + row;
          if (itemIndex < todoList.length) {
            columnItems.push(todoList[itemIndex]);
          }
        }
        
        // 计算该列的宽度
        const colWidth = this.calculateColumnWidth(columnItems);
        columnWidths.push(colWidth);
        totalCanvasWidth += colWidth + borderWidth; // 列宽 + 右边框
      }
      
      const totalHeight = actualRows * rowHeight;
      
      this.canvas.width = totalCanvasWidth;
      this.canvas.height = totalHeight;
      
      // 绘制白色背景
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, totalCanvasWidth, totalHeight);
      
      // 绘制表格外边框
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.strokeRect(0, 0, totalCanvasWidth, totalHeight);
      
      // 绘制表格（从上往下填充：第1列是1-10，第2列是11-20...）
      let currentX = borderWidth; // 起始位置（左边框后）
      for (let col = 0; col < actualColumns; col++) {
        const columnWidth = columnWidths[col];
        const colX = currentX;
        
        for (let row = 0; row < actualRows; row++) {
          // 计算项目索引：列索引 * 每列最大条目数 + 行索引
          const itemIndex = col * maxItemsPerColumn + row;
          if (itemIndex >= todoList.length) break;
          
          const item = todoList[itemIndex];
          const rowY = row * rowHeight;
          
          // 绘制单元格边框
          this.ctx.strokeStyle = borderColor;
          this.ctx.lineWidth = borderWidth;
          this.ctx.strokeRect(colX, rowY, columnWidth, rowHeight);
          
          // 绘制序号和文本（在同一行）
          const textX = colX + leftPadding; // 使用左边距
          const textY = rowY + rowHeight / 2; // 垂直居中
          
          // 绘制序号
          this.ctx.fillStyle = numberColor;
          this.ctx.font = `${numberFontSize}px ${fontFamily}`;
          this.ctx.textBaseline = 'middle';
          this.ctx.textAlign = 'left';
          const numberText = `${item.id}.`;
          this.ctx.fillText(numberText, textX, textY);
          
          // 计算文本起始位置（序号后面留出间距）
          const numberWidth = this.ctx.measureText(numberText).width;
          const textStartX = textX + numberWidth + 4; // 序号后留4px间距
          const maxTextWidth = columnWidth - (textStartX - colX) - cellPadding; // 右边距
          
          // 绘制文本（支持换行）
          this.ctx.fillStyle = textColor;
          this.ctx.font = `${fontSize}px ${fontFamily}`;
          this.ctx.textBaseline = 'middle';
          
          const lines = this.wrapText(item.text, maxTextWidth, 2);
          if (lines.length === 1) {
            // 单行文本，与序号同一行
            this.ctx.fillText(lines[0], textStartX, textY);
          } else {
            // 多行文本，第一行与序号对齐，其他行在下方
            lines.forEach((line, idx) => {
              const lineY = idx === 0 ? textY : textY + (idx * (fontSize + 4));
              this.ctx.fillText(line, textStartX, lineY);
            });
          }
        }
        
        // 移动到下一列的起始位置
        currentX += columnWidth + borderWidth;
      }
    }
  }

  // ============================================
  // 7. 主类 - LifeCountdown
  // ============================================

  window.LifeCountdown = class LifeCountdown {
    constructor() {
      this.dataManager = new DataManager();
      this.notionManager = new NotionDataManager(); // Notion 数据管理器
      this.dateCalculator = new DateCalculator();
      this.activityCalculator = new ActivityCalculator();
      this.currentData = null;
      this.isEditMode = false;
      this.todoEditEventsBound = false; // 跟踪想做的事情编辑事件是否已绑定
      
      // 获取section3元素（确保作用域限定）
      this.section = document.getElementById('section3');
      if (!this.section) {
        console.error('未找到section3元素');
        return;
      }
      
      // 初始化Canvas渲染器
      const weekChartCanvas = this.section.querySelector('#countdownWeekChart');
      const lifeStageCanvas = this.section.querySelector('#countdownLifeStageChart');
      const todoTableCanvas = this.section.querySelector('#countdownTodoTable');
      
      if (weekChartCanvas) {
        this.weekChartRenderer = new WeekChartRenderer(weekChartCanvas);
      }
      if (lifeStageCanvas) {
        this.lifeStageRenderer = new LifeStageRenderer(lifeStageCanvas);
      }
      if (todoTableCanvas) {
        this.todoTableRenderer = new TodoTableRenderer(todoTableCanvas);
      }
    }

    async init() {
      if (!this.section) return;
      
      await this.loadData();
      this.render();
      this.setupEventListeners();
    }

    async loadData() {
      // 先加载基础数据
      this.currentData = this.dataManager.loadData();
      
      // 如果是编辑模式（默认数据），尝试从 Notion 获取 todoList
      if (this.currentData.isDefault) {
        try {
          const notionTodos = await this.notionManager.fetchFromNotion();
          if (notionTodos && notionTodos.length > 0) {
            // 确保 id 连续
            this.currentData.todoList = notionTodos.map((item, index) => ({
              ...item,
              id: index + 1
            }));
          } else {
            // 如果没有 Notion 数据，使用示例数据
            this.currentData.todoList = this.notionManager.getSampleData();
          }
        } catch (error) {
          console.error('加载 Notion 数据失败，使用示例数据:', error);
          this.currentData.todoList = this.notionManager.getSampleData();
        }
      } else {
        // 用户体验模式：从本地存储获取，如果没有则使用示例数据
        // 如果数据有问题（比如有异常内容），也使用示例数据
        if (!this.currentData.todoList || this.currentData.todoList.length === 0) {
          this.currentData.todoList = this.notionManager.getSampleData();
        } else {
          // 验证数据有效性：确保每个项目都有 text 属性
          this.currentData.todoList = this.currentData.todoList.filter(item => 
            item && item.text && typeof item.text === 'string' && item.text.trim() !== ''
          );
          
          // 检查是否有异常数据（比如包含不当内容）
          const hasInvalidData = this.currentData.todoList.some(item => {
            const text = item.text.toLowerCase();
            // 检查是否包含明显异常的内容
            const invalidKeywords = ['屁股', '吃'];
            return invalidKeywords.some(keyword => text.includes(keyword));
          });
          
          // 如果过滤后数据为空或包含异常数据，使用示例数据
          if (this.currentData.todoList.length === 0 || hasInvalidData) {
            console.log('检测到异常数据，使用示例数据');
            this.currentData.todoList = this.notionManager.getSampleData();
          } else {
            // 确保 id 连续
            this.currentData.todoList = this.currentData.todoList.map((item, index) => ({
              ...item,
              id: index + 1
            }));
          }
        }
      }
    }

    async saveData() {
      if (!this.currentData) return;
      
      // 如果是编辑模式（默认数据），尝试保存到 Notion
      if (this.currentData.isDefault) {
        try {
          await this.notionManager.saveToNotion(this.currentData.todoList || []);
        } catch (error) {
          console.error('保存到 Notion 失败:', error);
        }
      } else {
        // 用户体验模式：保存到本地存储（仅暂存）
        this.currentData.lastModified = new Date().toISOString();
        this.dataManager.saveData(this.currentData);
      }
    }

    async resetToDefault() {
      // 清除本地存储并重置为默认数据
      this.currentData = this.dataManager.resetToDefault();
      
      // 如果是默认数据，尝试从 Notion 获取 todoList
      if (this.currentData.isDefault) {
        try {
          const notionTodos = await this.notionManager.fetchFromNotion();
          if (notionTodos && notionTodos.length > 0) {
            // 确保 id 连续
            this.currentData.todoList = notionTodos.map((item, index) => ({
              ...item,
              id: index + 1
            }));
          } else {
            // 如果没有 Notion 数据，使用示例数据
            this.currentData.todoList = this.notionManager.getSampleData();
          }
        } catch (error) {
          console.error('加载 Notion 数据失败，使用示例数据:', error);
          this.currentData.todoList = this.notionManager.getSampleData();
        }
      }
      
      // 退出编辑模式（如果正在编辑）
      this.exitEditMode();
      
      // 重新渲染页面
      this.render();
    }

    calculateAll() {
      const { birthDate, expectedLifespan } = this.currentData;
      const deathMonth = this.currentData.deathMonth || 1;
      const deathDay = this.currentData.deathDay || 1;
      
      // 计算当前年龄
      const currentAge = this.dateCalculator.calculateAge(birthDate);
      
      // 计算剩余时间
      const remainingTime = this.dateCalculator.calculateRemaining(
        birthDate,
        expectedLifespan,
        deathMonth,
        deathDay
      );
      
      // 计算死亡日期
      const deathDate = this.dateCalculator.calculateDeathDate(
        birthDate,
        expectedLifespan,
        deathMonth,
        deathDay
      );
      
      // 计算周数
      const passedWeeks = this.dateCalculator.calculatePassedWeeks(birthDate);
      const remainingWeeks = this.dateCalculator.calculateRemainingWeeks(
        birthDate,
        expectedLifespan,
        deathMonth,
        deathDay
      );
      
      // 计算活动
      const activities = this.currentData.activities.map(activity => {
        const calculated = this.activityCalculator.calculateActivity(activity, remainingTime);
        return { ...activity, calculated };
      });
      
      return {
        currentAge,
        remainingTime,
        deathDate,
        deathYear: deathDate.getFullYear(),
        passedWeeks,
        remainingWeeks,
        activities
      };
    }

    formatTimeDisplay(time) {
      return `${time.years}年 / ${time.months}月 / ${time.weeks}周 / ${time.days}天 / ${time.hours}小时 / ${time.minutes}分钟`;
    }

    formatDateDisplay(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}年${month}月${day}日`;
    }
    
    formatDateDisplayShort(dateString) {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}月${day}日`;
    }
    
    // 将文本按指定字符数换行
    wrapTextByChars(text, maxCharsPerLine) {
      if (!text) return '';
      const chars = text.split('');
      const lines = [];
      let currentLine = '';
      
      for (let i = 0; i < chars.length; i++) {
        currentLine += chars[i];
        if (currentLine.length >= maxCharsPerLine) {
          lines.push(currentLine);
          currentLine = '';
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines.join('<br>');
    }

    updateTextDisplay() {
      if (!this.section) return;
      
      const calculated = this.calculateAll();
      const { currentAge, remainingTime, deathYear, deathDate } = calculated;
      
      // 更新文本显示（如果不在编辑模式或元素未被编辑）
      const birthDateDisplay = this.section.querySelector('#countdownBirthDateDisplay');
      const currentAgeDisplay = this.section.querySelector('#countdownCurrentAgeDisplay');
      const lifespanDisplay = this.section.querySelector('#countdownLifespanDisplay');
      const deathYearDisplay = this.section.querySelector('#countdownDeathYearDisplay');
      const deathDateDisplay = this.section.querySelector('#countdownDeathDateDisplay');
      const remainingTimeDisplay = this.section.querySelector('#countdownRemainingTimeDisplay');
      
      // 只在非编辑模式或元素未被编辑时更新
      if (birthDateDisplay && !birthDateDisplay.dataset.editing) {
        birthDateDisplay.innerHTML = `<strong style="color: #000;">「${this.formatDateDisplay(this.currentData.birthDate)}」</strong>`;
      }
      if (currentAgeDisplay) {
        currentAgeDisplay.innerHTML = `<strong style="color: #000;">「${this.formatTimeDisplay(currentAge)}」</strong>`;
      }
      if (lifespanDisplay && !lifespanDisplay.dataset.editing) {
        lifespanDisplay.innerHTML = `<strong style="color: #000;">「${this.currentData.expectedLifespan}岁」</strong>`;
      }
      if (deathYearDisplay) {
        deathYearDisplay.innerHTML = `<strong style="color: #000;">「${deathYear}年」</strong>`;
      }
      if (deathDateDisplay && !deathDateDisplay.dataset.editing) {
        // 使用死亡日期的月日，但需要从表单获取
        const deathMonth = this.currentData.deathMonth || 1;
        const deathDay = this.currentData.deathDay || 1;
        const month = String(deathMonth).padStart(2, '0');
        const day = String(deathDay).padStart(2, '0');
        deathDateDisplay.innerHTML = `<strong style="color: #000;">「${month}月${day}日」</strong>`;
      }
      if (remainingTimeDisplay) {
        remainingTimeDisplay.innerHTML = `<strong style="color: #000;">「${this.formatTimeDisplay(remainingTime)}」</strong>`;
      }
    }

    updateActivitiesDisplay() {
      if (!this.section) return;
      
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      if (!container) return;
      
      const calculated = this.calculateAll();
      const { activities } = calculated;
      
      let html = '<div class="countdown-activities-list">';
      
      // 显示现有活动
      if (activities.length === 0) {
        // 如果没有活动，显示一个带加号按钮的空行
        html += `
          <p style="display: inline-flex; align-items: center; gap: 8px;">
            <button class="countdown-activity-btn-add" style="
              background: transparent;
              border: 1px solid #ccc;
              border-radius: 3px;
              color: #666;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              padding: 2px 8px;
              line-height: 1;
              font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
              transition: all 0.2s;
              min-width: 24px;
              height: 24px;
            " onmouseover="this.style.color='#000'; this.style.borderColor='#000'; this.style.backgroundColor='#f5f5f5';" onmouseout="this.style.color='#666'; this.style.borderColor='#ccc'; this.style.backgroundColor='transparent';">+</button>
          </p>
        `;
      } else {
        activities.forEach((activity, index) => {
          const { name, frequency, duration, calculated } = activity;
          const freqUnitText = frequency.unit === 'day' ? '天' : 
                              frequency.unit === 'week' ? '周' :
                              frequency.unit === 'month' ? '月' : '年';
          
          const durationUnitText = this.getDurationUnitText(duration, activity);
          const currentDurationUnit = activity.durationUnit || 'hour';
          const durationUnitOptionsList = this.getDurationUnitOptionsList(frequency.unit);
          
          // 判断活动是否已完成（活动名称已填写）
          const isCompleted = name && name.trim() !== '';
          
          if (isCompleted) {
            // 显示模式：显示文本，没有下划线
            // 判断是否允许交互（只有在编辑模式下才允许交互）
            const canInteract = this.isEditMode && (!this.currentData.isDefault);
            const buttonStyle = canInteract ? '' : 'display: none;';
            const textCursor = canInteract ? 'cursor: pointer;' : 'cursor: default;';
            
            html += `
              <p style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                <span class="countdown-activity-text" data-index="${index}" style="flex: 1; ${textCursor}">如果我<strong style="color: #000;">「${name}」</strong>是每<strong style="color: #000;">「${freqUnitText}」</strong>，发生<strong style="color: #000;">「${frequency.value}次」</strong>，每次<strong style="color: #000;">「${durationUnitText}」</strong>，那么余下的时间里，我还可以做<strong style="color: #000;">「${calculated.times}次${name}」</strong>，共计<strong style="color: #000;">「${calculated.totalHours}小时」</strong>。</span>
                <button class="countdown-activity-btn-add" data-index="${index}" style="
                  background: transparent;
                  border: none;
                  color: #666;
                  font-size: 20px;
                  font-weight: bold;
                  cursor: pointer;
                  padding: 0;
                  line-height: 1;
                  font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                  transition: all 0.2s;
                  width: 22px;
                  height: 22px;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  ${buttonStyle}
                " onmouseover="this.style.color='#000'; this.style.transform='scale(1.2)';" onmouseout="this.style.color='#666'; this.style.transform='scale(1)';" title="添加新活动">+</button>
                <button class="countdown-activity-btn-remove" data-index="${index}" style="
                  background: transparent;
                  border: none;
                  color: #ff6b6b;
                  font-size: 20px;
                  font-weight: bold;
                  cursor: pointer;
                  padding: 0;
                  line-height: 1;
                  font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                  transition: all 0.2s;
                  width: 22px;
                  height: 22px;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  ${buttonStyle}
                " onmouseover="this.style.color='#d32f2f'; this.style.transform='scale(1.2)';" onmouseout="this.style.color='#ff6b6b'; this.style.transform='scale(1)';" title="删除">-</button>
              </p>
            `;
          } else {
            // 编辑模式：显示可编辑表单，有下划线，有✓、+、-按钮
            // 判断是否允许交互（只有在编辑模式下才允许交互）
            const canInteract = this.isEditMode && (!this.currentData.isDefault);
            
            // 如果不可交互，不显示编辑表单，显示为只读文本
            if (!canInteract) {
              html += `
                <p style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                  <span style="flex: 1;">如果我<strong style="color: #000;">「${name || '...'}」</strong>是每<strong style="color: #000;">「${freqUnitText}」</strong>，发生<strong style="color: #000;">「${frequency.value}次」</strong>，每次<strong style="color: #000;">「${durationUnitText}」</strong>，那么余下的时间里，我还可以做<strong style="color: #000;">「${calculated.times}次${name || '...'}」</strong>，共计<strong style="color: #000;">「${calculated.totalHours}小时」</strong>。</span>
                </p>
              `;
            } else {
            
            let durationUnitOptions = '';
            durationUnitOptionsList.forEach(opt => {
              const selected = opt.value === currentDurationUnit ? 'selected' : '';
              durationUnitOptions += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
            });
            
            html += `
              <div class="countdown-activity-item-edit" data-index="${index}" style="margin-bottom: 1rem;">
                <p style="display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span>如果我</span>
                  <input type="text" class="countdown-inline-input" data-field="name" data-index="${index}" value="${name}" placeholder="活动名称" style="min-width: 50px; max-width: 80px;">
                  <span>是每</span>
                  <select class="countdown-inline-select" data-field="freqUnit" data-index="${index}" style="
                    border: none;
                    border-bottom: 2px solid #999;
                    background: transparent;
                    color: #999;
                    font-weight: normal;
                    font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                    padding: 0 4px;
                    margin: 0 2px;
                    outline: none;
                    cursor: pointer;
                    min-width: 40px;
                    max-width: 50px;
                  ">
                    <option value="day" ${frequency.unit === 'day' ? 'selected' : ''}>天</option>
                    <option value="week" ${frequency.unit === 'week' ? 'selected' : ''}>周</option>
                    <option value="month" ${frequency.unit === 'month' ? 'selected' : ''}>月</option>
                    <option value="year" ${frequency.unit === 'year' ? 'selected' : ''}>年</option>
                  </select>
                  <span>，发生</span>
                  <input type="number" class="countdown-inline-input countdown-inline-input-number" data-field="freqValue" data-index="${index}" value="${frequency.value}" min="1" style="min-width: 30px; max-width: 40px;">
                  <span>次</span>
                  <span>，每次</span>
                  <input type="number" class="countdown-inline-input countdown-inline-input-number" data-field="duration" data-index="${index}" value="${duration}" min="0" step="0.1" style="min-width: 30px; max-width: 50px;">
                  <select class="countdown-inline-select" data-field="durationUnit" data-index="${index}" style="
                    border: none;
                    border-bottom: 2px solid #999;
                    background: transparent;
                    color: #999;
                    font-weight: normal;
                    font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                    padding: 0 4px;
                    margin: 0 2px;
                    outline: none;
                    cursor: pointer;
                    min-width: 50px;
                    max-width: 60px;
                  ">
                    ${durationUnitOptions}
                  </select>
                  <span>，那么余下的时间里，我还可以做</span>
                  <strong style="color: #000;">「${calculated.times}次${name || '...'}」</strong>
                  <span>，共计</span>
                  <strong style="color: #000;">「${calculated.totalHours}小时」</strong>
                  <span>。</span>
                  <button class="countdown-activity-btn-confirm" data-index="${index}" style="
                    background: transparent;
                    border: none;
                    color: #4CAF50;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                    transition: all 0.2s;
                    width: 22px;
                    height: 22px;
                    flex-shrink: 0;
                    margin-left: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  " onmouseover="this.style.color='#2E7D32'; this.style.transform='scale(1.2)';" onmouseout="this.style.color='#4CAF50'; this.style.transform='scale(1)';" title="保存">✓</button>
                  <button class="countdown-activity-btn-add" data-index="${index}" style="
                    background: transparent;
                    border: none;
                    color: #666;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                    transition: all 0.2s;
                    width: 22px;
                    height: 22px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  " onmouseover="this.style.color='#000'; this.style.transform='scale(1.2)';" onmouseout="this.style.color='#666'; this.style.transform='scale(1)';" title="添加新活动">+</button>
                  <button class="countdown-activity-btn-remove" data-index="${index}" style="
                    background: transparent;
                    border: none;
                    color: #ff6b6b;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                    transition: all 0.2s;
                    width: 22px;
                    height: 22px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  " onmouseover="this.style.color='#d32f2f'; this.style.transform='scale(1.2)';" onmouseout="this.style.color='#ff6b6b'; this.style.transform='scale(1)';" title="删除">-</button>
                </p>
              </div>
            `;
            }
          }
        });
      }
      
      html += '</div>';
      container.innerHTML = html;
      
      // 绑定事件
      this.bindActivityDisplayEvents();
    }
    
    bindActivityDisplayEvents() {
      if (!this.section) return;
      
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      if (!container) return;
      
      // 判断是否允许交互（只有在编辑模式下且不是默认数据才允许交互）
      const canInteract = this.isEditMode && (!this.currentData.isDefault);
      
      // 活动文本点击事件（进入编辑模式，将已完成的活动重新变为可编辑）
      container.querySelectorAll('.countdown-activity-text').forEach(text => {
        text.addEventListener('click', (e) => {
          if (!canInteract) return; // 不允许交互时直接返回
          e.stopPropagation();
          const index = parseInt(text.dataset.index);
          // 将活动名称清空，使其重新进入编辑模式
          if (this.currentData.activities[index]) {
            this.currentData.activities[index].name = '';
            this.updateActivitiesDisplay();
          }
        });
      });
      
      // 添加按钮事件（只在显示模式下）
      container.querySelectorAll('.countdown-activity-btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!canInteract) return; // 不允许交互时直接返回
          e.stopPropagation();
          const index = btn.dataset.index !== undefined ? parseInt(btn.dataset.index) : -1;
          this.addActivityAfterIndex(index);
        });
      });
      
      // 确认按钮事件（编辑模式下）
      container.querySelectorAll('.countdown-activity-btn-confirm').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!canInteract) return; // 不允许交互时直接返回
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          this.confirmActivityEdit(index);
        });
      });
      
      // 删除按钮事件
      container.querySelectorAll('.countdown-activity-btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!canInteract) return; // 不允许交互时直接返回
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          this.showDeleteConfirmDialog(index);
        });
      });
      
      // 编辑模式下的输入框和选择框事件
      container.querySelectorAll('.countdown-activity-item-edit').forEach(item => {
        const index = parseInt(item.dataset.index);
        
        // 如果不可交互，禁用所有输入框和选择框
        if (!canInteract) {
          item.querySelectorAll('input, select').forEach(input => {
            input.disabled = true;
            input.style.pointerEvents = 'none';
            input.style.opacity = '0.6';
          });
          return;
        }
        
        // 检查是否已经绑定过事件（避免重复绑定）
        if (item.dataset.eventsBound === 'true') {
          return;
        }
        item.dataset.eventsBound = 'true';
        
        // 频率单位选择联动
        const freqUnitSelect = item.querySelector('select[data-field="freqUnit"]');
        if (freqUnitSelect) {
          freqUnitSelect.addEventListener('change', (e) => {
            this.updateActivityDurationUnitOptions(index);
            this.updateActivityDataAndDisplay(index);
          });
        }
        
        // 活动名称输入框：使用防抖，避免频繁重新渲染导致失去焦点
        const nameInput = item.querySelector('input[data-field="name"]');
        if (nameInput) {
          let nameInputTimeout;
          nameInput.addEventListener('input', () => {
            // 先更新数据
            this.currentData.activities[index].name = nameInput.value;
            // 只更新计算结果部分，不重新渲染整个列表
            this.updateActivityCalculatedDisplay(index);
            // 防抖保存
            clearTimeout(nameInputTimeout);
            nameInputTimeout = setTimeout(() => {
              this.saveData();
            }, 500);
          });
        }
        
        // 其他输入框和持续时间单位选择变化事件
        item.querySelectorAll('input[data-field]:not([data-field="name"]), select[data-field="durationUnit"]').forEach(input => {
          input.addEventListener('input', () => {
            this.updateActivityDataAndDisplay(index);
          });
          input.addEventListener('change', () => {
            this.updateActivityDataAndDisplay(index);
          });
        });
        
        // 选择框样式更新（选中后变黑加粗，下划线）
        item.querySelectorAll('select').forEach(select => {
          // 初始化样式
          if (select.value) {
            select.style.color = '#000';
            select.style.fontWeight = 'bold';
            select.style.borderBottomColor = '#000';
          }
          
          select.addEventListener('change', () => {
            if (select.value) {
              select.style.color = '#000';
              select.style.fontWeight = 'bold';
              select.style.borderBottomColor = '#000';
            }
          });
        });
      });
    }
    
    updateActivityDurationUnitOptions(index) {
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      const item = container.querySelector(`.countdown-activity-item-edit[data-index="${index}"]`);
      if (!item) return;
      
      const freqUnitSelect = item.querySelector('select[data-field="freqUnit"]');
      const durationUnitSelect = item.querySelector('select[data-field="durationUnit"]');
      if (!freqUnitSelect || !durationUnitSelect) return;
      
      const freqUnit = freqUnitSelect.value;
      const currentDurationUnit = this.currentData.activities[index]?.durationUnit || 'hour';
      const optionList = this.getDurationUnitOptionsList(freqUnit);
      
      // 设置选项，并保持当前选中的值（如果有效）
      let optionsHtml = '';
      let selectedValue = currentDurationUnit;
      const validUnits = optionList.map(o => o.value);
      if (!validUnits.includes(currentDurationUnit)) {
        selectedValue = optionList[0].value;
      }
      
      optionList.forEach(opt => {
        const selected = opt.value === selectedValue ? 'selected' : '';
        optionsHtml += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
      });
      durationUnitSelect.innerHTML = optionsHtml;
      durationUnitSelect.value = selectedValue;
      
      // 更新样式
      durationUnitSelect.style.color = '#000';
      durationUnitSelect.style.fontWeight = 'bold';
      durationUnitSelect.style.borderBottomColor = '#000';
    }
    
    updateActivityDataAndDisplay(index) {
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      const item = container.querySelector(`.countdown-activity-item-edit[data-index="${index}"]`);
      if (!item || !this.currentData.activities[index]) return;
      
      const nameInput = item.querySelector('input[data-field="name"]');
      const freqValueInput = item.querySelector('input[data-field="freqValue"]');
      const freqUnitSelect = item.querySelector('select[data-field="freqUnit"]');
      const durationInput = item.querySelector('input[data-field="duration"]');
      const durationUnitSelect = item.querySelector('select[data-field="durationUnit"]');
      
      if (nameInput) {
        this.currentData.activities[index].name = nameInput.value;
      }
      if (freqValueInput) {
        this.currentData.activities[index].frequency.value = parseInt(freqValueInput.value) || 1;
      }
      if (freqUnitSelect) {
        this.currentData.activities[index].frequency.unit = freqUnitSelect.value;
      }
      if (durationInput) {
        this.currentData.activities[index].duration = parseFloat(durationInput.value) || 0;
      }
      if (durationUnitSelect) {
        this.currentData.activities[index].durationUnit = durationUnitSelect.value;
      }
      
      // 只更新计算结果部分，不重新渲染整个列表（避免输入框失去焦点）
      this.updateActivityCalculatedDisplay(index);
      
      // 自动保存
      this.saveData();
    }
    
    updateActivityCalculatedDisplay(index) {
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      const item = container.querySelector(`.countdown-activity-item-edit[data-index="${index}"]`);
      if (!item || !this.currentData.activities[index]) return;
      
      const activity = this.currentData.activities[index];
      const calculated = this.calculateActivity(activity);
      
      // 更新计算结果显示
      const calculatedTimesEl = item.querySelector('strong:first-of-type');
      const calculatedHoursEl = item.querySelector('strong:last-of-type');
      
      if (calculatedTimesEl) {
        calculatedTimesEl.innerHTML = `「${calculated.times}次${activity.name || '...'}」`;
      }
      if (calculatedHoursEl) {
        calculatedHoursEl.innerHTML = `「${calculated.totalHours}小时」`;
      }
    }
    
    showDeleteConfirmDialog(index) {
      // 创建自定义确认对话框
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      const dialogContent = document.createElement('div');
      dialogContent.style.cssText = `
        background: #1a1a1a;
        padding: 24px 32px;
        border-radius: 8px;
        color: #e0e0e0;
        font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        min-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      `;
      
      const message = document.createElement('p');
      message.textContent = '确定要删除这个活动吗？';
      message.style.cssText = 'margin: 0 0 20px 0; font-size: 16px;';
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 12px;';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '取消';
      cancelBtn.style.cssText = `
        background: #38662a;
        color: #c8e6a7;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 14px;
        transition: all 0.2s;
      `;
      cancelBtn.onmouseover = () => {
        cancelBtn.style.background = '#4a7a3a';
      };
      cancelBtn.onmouseout = () => {
        cancelBtn.style.background = '#38662a';
      };
      cancelBtn.onclick = () => {
        document.body.removeChild(dialog);
      };
      
      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = '确定';
      confirmBtn.style.cssText = `
        background: #c8e6a7;
        color: #38662a;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.2s;
      `;
      confirmBtn.onmouseover = () => {
        confirmBtn.style.background = '#d8f6b7';
      };
      confirmBtn.onmouseout = () => {
        confirmBtn.style.background = '#c8e6a7';
      };
      confirmBtn.onclick = () => {
        document.body.removeChild(dialog);
        this.removeActivity(index);
      };
      
      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(confirmBtn);
      dialogContent.appendChild(message);
      dialogContent.appendChild(buttonContainer);
      dialog.appendChild(dialogContent);
      document.body.appendChild(dialog);
      
      // 点击背景关闭
      dialog.onclick = (e) => {
        if (e.target === dialog) {
          document.body.removeChild(dialog);
        }
      };
    }
    
    confirmActivityEdit(index) {
      // 确认编辑，更新数据并切换回显示模式
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      const item = container.querySelector(`.countdown-activity-item-edit[data-index="${index}"]`);
      if (!item || !this.currentData.activities[index]) return;
      
      const nameInput = item.querySelector('input[data-field="name"]');
      const freqValueInput = item.querySelector('input[data-field="freqValue"]');
      const freqUnitSelect = item.querySelector('select[data-field="freqUnit"]');
      const durationInput = item.querySelector('input[data-field="duration"]');
      const durationUnitSelect = item.querySelector('select[data-field="durationUnit"]');
      
      // 更新所有数据
      if (nameInput) {
        this.currentData.activities[index].name = nameInput.value.trim();
      }
      if (freqValueInput) {
        this.currentData.activities[index].frequency.value = parseInt(freqValueInput.value) || 1;
      }
      if (freqUnitSelect) {
        this.currentData.activities[index].frequency.unit = freqUnitSelect.value;
      }
      if (durationInput) {
        this.currentData.activities[index].duration = parseFloat(durationInput.value) || 0;
      }
      if (durationUnitSelect) {
        this.currentData.activities[index].durationUnit = durationUnitSelect.value;
      }
      
      // 保存数据
      this.saveData();
      
      // 重新渲染，如果活动名称已填写，会自动切换为显示模式（没有下划线，没有✓按钮）
      this.updateActivitiesDisplay();
    }
    
    editActivityInline(index) {
      // 进入编辑模式，显示可编辑的表单
      this.isEditMode = true;
      this.updateActivitiesDisplay();
    }
    
    addActivityAfterIndex(index) {
      if (!this.currentData.activities) {
        this.currentData.activities = [];
      }
      
      const newActivity = {
        id: Date.now(),
        name: '',
        frequency: { value: 1, unit: 'day' },
        duration: 1,
        durationUnit: 'hour'
      };
      
      if (index === -1) {
        // 如果没有活动，直接添加
        this.currentData.activities.push(newActivity);
      } else {
        // 在指定索引后添加
        this.currentData.activities.splice(index + 1, 0, newActivity);
      }
      
      // 保存数据
      this.saveData().then(() => {
        // 进入编辑模式以便编辑新添加的活动
        this.isEditMode = true;
        // 更新显示
        this.updateActivitiesDisplay();
      });
    }
    
    getDurationUnitText(duration, activity) {
      // 根据活动数据返回持续时间单位文本
      const durationUnit = activity.durationUnit || 'hour';
      const unitTextMap = {
        'second': '秒',
        'minute': '分钟',
        'hour': '小时',
        'day': '天',
        'week': '周',
        'month': '月'
      };
      const unitText = unitTextMap[durationUnit] || '小时';
      return `${duration}${unitText}`;
    }
    
    bindActivityEvents() {
      if (!this.section) return;
      
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      if (!container) return;
      
      // 添加活动按钮
      const addBtn = container.querySelector('.countdown-activity-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          this.addActivityInline();
        });
      }
      
      // 频率单位选择联动
      container.querySelectorAll('select[data-field="freqUnit"]').forEach(select => {
        // 初始化样式
        select.style.color = '#000';
        select.style.fontWeight = 'bold';
        select.style.borderBottomColor = '#000';
        
        select.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.updateDurationUnitOptions(index);
          this.updateActivityData(index);
        });
      });
      
      // 持续时间单位选择
      container.querySelectorAll('select[data-field="durationUnit"]').forEach(select => {
        // 初始化样式
        select.style.color = '#000';
        select.style.fontWeight = 'bold';
        select.style.borderBottomColor = '#000';
        
        select.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.updateActivityData(index);
        });
      });
      
      // 输入框变化事件
      container.querySelectorAll('input[data-field]').forEach(input => {
        input.addEventListener('input', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.updateActivityData(index);
        });
        input.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.updateActivityData(index);
        });
      });
      
      // 删除按钮
      container.querySelectorAll('.countdown-btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.removeActivity(index);
        });
      });
    }
    
    addActivityInline() {
      if (!this.currentData.activities) {
        this.currentData.activities = [];
      }
      this.currentData.activities.push({
        id: Date.now(),
        name: '',
        frequency: { value: 1, unit: 'day' },
        duration: 1,
        durationUnit: 'hour'
      });
      this.updateActivitiesDisplay();
    }
    
    updateDurationUnitOptions(index) {
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      const item = container.querySelector(`.countdown-activity-item-inline[data-index="${index}"]`);
      if (!item) return;
      
      const freqUnitSelect = item.querySelector('select[data-field="freqUnit"]');
      const durationUnitSelect = item.querySelector('select[data-field="durationUnit"]');
      if (!freqUnitSelect || !durationUnitSelect) return;
      
      const freqUnit = freqUnitSelect.value;
      const currentDurationUnit = this.currentData.activities[index]?.durationUnit || 'hour';
      
      // 设置选项，并保持当前选中的值
      const optionList = this.getDurationUnitOptionsList(freqUnit);
      let optionsHtml = '';
      optionList.forEach(opt => {
        const selected = opt.value === currentDurationUnit ? 'selected' : '';
        optionsHtml += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
      });
      durationUnitSelect.innerHTML = optionsHtml;
      
      // 更新活动数据中的持续时间单位（如果当前值不在新选项中，使用第一个选项）
      const validUnits = optionList.map(o => o.value);
      if (!validUnits.includes(currentDurationUnit)) {
        this.currentData.activities[index].durationUnit = optionList[0].value;
        durationUnitSelect.value = optionList[0].value;
      }
      
      // 更新选择框样式（选中后变黑加粗，下划线）
      const updateSelectStyle = (select) => {
        if (select.value) {
          select.style.color = '#000';
          select.style.fontWeight = 'bold';
          select.style.borderBottomColor = '#000';
        }
      };
      
      updateSelectStyle(freqUnitSelect);
      updateSelectStyle(durationUnitSelect);
    }
    
    getDurationUnitOptionsList(freqUnit) {
      // 根据频率单位返回持续时间单位选项列表
      const options = {
        day: [
          { value: 'second', text: '秒' },
          { value: 'minute', text: '分钟' },
          { value: 'hour', text: '小时' }
        ],
        week: [
          { value: 'minute', text: '分钟' },
          { value: 'hour', text: '小时' },
          { value: 'day', text: '天' }
        ],
        month: [
          { value: 'hour', text: '小时' },
          { value: 'day', text: '天' },
          { value: 'week', text: '周' }
        ],
        year: [
          { value: 'day', text: '天' },
          { value: 'week', text: '周' },
          { value: 'month', text: '月' }
        ]
      };
      
      return options[freqUnit] || options.day;
    }
    
    updateActivityData(index) {
      const container = this.section.querySelector('#countdownActivitiesDisplay');
      const item = container.querySelector(`.countdown-activity-item-inline[data-index="${index}"]`);
      if (!item || !this.currentData.activities[index]) return;
      
      const nameInput = item.querySelector('input[data-field="name"]');
      const freqValueInput = item.querySelector('input[data-field="freqValue"]');
      const freqUnitSelect = item.querySelector('select[data-field="freqUnit"]');
      const durationInput = item.querySelector('input[data-field="duration"]');
      const durationUnitSelect = item.querySelector('select[data-field="durationUnit"]');
      
      if (nameInput) {
        this.currentData.activities[index].name = nameInput.value;
      }
      if (freqValueInput) {
        this.currentData.activities[index].frequency.value = parseInt(freqValueInput.value) || 1;
      }
      if (freqUnitSelect) {
        this.currentData.activities[index].frequency.unit = freqUnitSelect.value;
        // 更新持续时间单位选项
        this.updateDurationUnitOptions(index);
      }
      if (durationInput) {
        this.currentData.activities[index].duration = parseFloat(durationInput.value) || 0;
      }
      if (durationUnitSelect) {
        this.currentData.activities[index].durationUnit = durationUnitSelect.value;
      }
      
      // 实时更新显示
      this.updateActivitiesDisplay();
      
      // 自动保存
      this.saveData();
    }

    renderCanvas() {
      const calculated = this.calculateAll();
      const { passedWeeks, remainingWeeks } = calculated;
      
      // 渲染生命周图
      if (this.weekChartRenderer) {
        this.weekChartRenderer.render(passedWeeks, remainingWeeks);
      }
      
      // 渲染生命阶段图
      if (this.lifeStageRenderer) {
        const calculated = this.calculateAll();
        const deathDate = calculated.deathDate;
        this.lifeStageRenderer.render(
          this.currentData.birthDate,
          deathDate,
          this.currentData.majorEvents || [],
          this.isEditMode || false
        );
        // 渲染添加按钮
        this.renderLifeStageButtons();
      }
      
      // 渲染想做的事情表格
      if (this.todoTableRenderer) {
        this.todoTableRenderer.render(this.currentData.todoList || []);
      }
    }

    renderLifeStageButtons() {
      if (!this.lifeStageRenderer) return;
      
      const buttonsContainer = this.section.querySelector('#lifeStageButtons');
      if (!buttonsContainer) return;
      
      // 清空现有按钮和文本点击区域
      buttonsContainer.innerHTML = '';
      
      // 只在编辑模式下启用交互
      if (this.isEditMode) {
        buttonsContainer.style.pointerEvents = 'auto';
      } else {
        buttonsContainer.style.pointerEvents = 'none';
        return; // 非编辑模式下不创建任何按钮
      }
      
      // 检查 buttonPositions 是否存在且不为空
      if (!this.lifeStageRenderer.buttonPositions || this.lifeStageRenderer.buttonPositions.length === 0) {
        console.warn('buttonPositions 未设置或为空，可能需要先调用 lifeStageRenderer.render()');
        return;
      }
      
      const { yearWidth } = this.lifeStageRenderer.design;
      
      // 创建文本点击区域（用于编辑）- 只在编辑模式下
      if (this.lifeStageRenderer.eventTextPositions) {
        this.lifeStageRenderer.eventTextPositions.forEach((pos) => {
          const clickArea = document.createElement('div');
          clickArea.className = 'life-stage-text-click-area';
          clickArea.style.cssText = `
            position: absolute;
            left: ${pos.x}px;
            top: ${pos.y}px;
            width: ${pos.width}px;
            height: ${pos.height}px;
            background: transparent;
            cursor: pointer;
            z-index: 10;
          `;
          clickArea.setAttribute('data-age', pos.age);
          clickArea.setAttribute('data-event-index', pos.eventIndex);
          clickArea.setAttribute('data-year', pos.year);
          
          clickArea.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleEditEvent(pos.age, pos.year, pos.eventIndex, pos.text, pos.x + pos.width / 2, pos.y);
          });
          
          buttonsContainer.appendChild(clickArea);
        });
      }
      
      // 创建添加按钮（在最后一个事件下方）- 只在编辑模式下
      this.lifeStageRenderer.buttonPositions.forEach((pos) => {
        const { age, year, x, y, hasEvents } = pos;
        
        // 检查该年龄是否已有6个事件
        const eventsForAge = this.currentData.majorEvents?.find(e => e.age === age);
        const eventCount = eventsForAge?.events?.length || 0;
        const canAddMore = eventCount < 6;
        
        if (!canAddMore) return; // 如果已有6个事件，不显示按钮
        
        // 创建按钮
        const button = document.createElement('button');
        button.className = 'life-stage-add-btn';
        button.style.cssText = `
          position: absolute;
          left: ${x - yearWidth / 2}px;
          top: ${y}px;
          width: ${yearWidth}px;
          height: 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          font-size: 12px;
          color: #acacac;
          text-align: center;
          padding: 0;
          z-index: 20;
        `;
        button.textContent = '+';
        button.setAttribute('data-age', age);
        button.setAttribute('data-year', year);
        
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAddEvent(age, year, x, y, eventCount);
        });
        
        buttonsContainer.appendChild(button);
      });
    }
    
    handleAddEvent(age, year, x, y, currentEventCount = 0) {
      // 检查是否已达到6个事件
      if (currentEventCount >= 6) {
        return;
      }
      
      const { yearWidth } = this.lifeStageRenderer.design;
      
      // 创建输入框（显示在+号按钮的位置）
      const input = document.createElement('input');
      input.type = 'text';
      input.value = '';
      input.maxLength = 18; // 最多18个中文字
      input.placeholder = '输入事件（最多18字）';
      input.style.cssText = `
        position: absolute;
        left: ${x - yearWidth / 2}px;
        top: ${y}px;
        width: ${yearWidth}px;
        height: 20px;
        padding: 0;
        border: 1px solid #000;
        font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 12px;
        z-index: 1000;
        text-align: center;
        background: #fff;
      `;
      
      const buttonsContainer = this.section.querySelector('#lifeStageButtons');
      buttonsContainer.appendChild(input);
      input.focus();
      
      const saveEvent = async () => {
        const text = input.value.trim();
        if (text) {
          // 添加新事件
          if (!this.currentData.majorEvents) {
            this.currentData.majorEvents = [];
          }
          
          const eventIndex = this.currentData.majorEvents.findIndex(e => e.age === age);
          if (eventIndex >= 0) {
            // 更新现有事件列表（添加新事件）
            const existingEvents = this.currentData.majorEvents[eventIndex].events || [];
            if (existingEvents.length < 6) {
              existingEvents.push(text);
              this.currentData.majorEvents[eventIndex].events = existingEvents;
            }
          } else {
            // 创建新事件
            this.currentData.majorEvents.push({
              age,
              year,
              events: [text]
            });
          }
          
          // 保存数据
          await this.saveData();
          
          // 重新渲染
          this.renderCanvas();
        }
        
        input.remove();
      };
      
      input.addEventListener('blur', saveEvent);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveEvent();
        } else if (e.key === 'Escape') {
          input.remove();
        }
      });
    }
    
    handleEditEvent(age, year, eventIndex, currentText, x, y) {
      // 创建输入框
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentText;
      input.maxLength = 18; // 最多18个中文字
      input.style.cssText = `
        position: absolute;
        left: ${x - 36}px;
        top: ${y}px;
        width: 72px;
        padding: 4px;
        border: 1px solid #000;
        font-family: 'Fusion Pixel', Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 12px;
        z-index: 1000;
        text-align: center;
      `;
      
      const buttonsContainer = this.section.querySelector('#lifeStageButtons');
      buttonsContainer.appendChild(input);
      input.focus();
      input.select();
      
      const saveEvent = async () => {
        const text = input.value.trim();
        
        if (!this.currentData.majorEvents) {
          this.currentData.majorEvents = [];
        }
        
        const eventDataIndex = this.currentData.majorEvents.findIndex(e => e.age === age);
        if (eventDataIndex >= 0) {
          const events = this.currentData.majorEvents[eventDataIndex].events || [];
          if (text) {
            // 更新事件
            events[eventIndex] = text;
            this.currentData.majorEvents[eventDataIndex].events = events;
          } else {
            // 删除事件
            events.splice(eventIndex, 1);
            if (events.length === 0) {
              // 如果没有事件了，删除整个年龄的事件数据
              this.currentData.majorEvents.splice(eventDataIndex, 1);
            } else {
              this.currentData.majorEvents[eventDataIndex].events = events;
            }
          }
        }
        
        // 保存数据
        await this.saveData();
        
        // 重新渲染
        this.renderCanvas();
        
        input.remove();
      };
      
      input.addEventListener('blur', saveEvent);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveEvent();
        } else if (e.key === 'Escape') {
          input.remove();
        }
      });
    }

    render() {
      if (!this.section) return;
      
      this.updateTextDisplay();
      this.updateProgressBar();
      this.updateActivitiesDisplay();
      this.renderCanvas();
      this.updateButtonVisibility();
      
      // 更新用户数据标记（用于CSS控制显示/隐藏）
      if (!this.isEditMode && !this.currentData.isDefault) {
        document.body.setAttribute('data-user-data', 'true');
        // 更新用户思考内容显示
        this.updateReflectionDisplay();
        // 渲染想做的事情列表（用户内容页显示，只读模式）
        this.renderTodoListEdit(false);
      } else {
        document.body.removeAttribute('data-user-data');
        // 隐藏用户思考内容显示（只在非用户数据时隐藏）
        if (this.currentData.isDefault) {
          const reflectionDisplay = this.section.querySelector('#countdownReflectionDisplay');
          if (reflectionDisplay) {
            reflectionDisplay.style.display = 'none';
          }
        }
      }
    }
    
    updateReflectionDisplay() {
      if (!this.section) return;
      
      const reflectionDisplay = this.section.querySelector('#countdownReflectionDisplay');
      const reflectionContent = this.section.querySelector('#countdownReflectionContent');
      
      if (!reflectionDisplay || !reflectionContent) return;
      
      // 如果有思考内容，显示
      if (this.currentData.reflection && this.currentData.reflection.trim()) {
        // 使用 innerHTML 以支持换行等格式
        reflectionContent.innerHTML = this.currentData.reflection.replace(/\n/g, '<br>');
        reflectionDisplay.style.display = 'block';
      } else {
        // 即使没有内容，也显示容器（标题会显示）
        reflectionDisplay.style.display = 'block';
        reflectionContent.innerHTML = '';
      }
    }
    
    updateProgressBar() {
      if (!this.section) return;
      
      const calculated = this.calculateAll();
      const { passedWeeks, remainingWeeks } = calculated;
      const totalWeeks = passedWeeks + remainingWeeks;
      const percentage = totalWeeks > 0 ? Math.round((passedWeeks / totalWeeks) * 100) : 0;
      
      const progressFilled = this.section.querySelector('#countdownProgressFilled');
      const progressPercentage = this.section.querySelector('#countdownProgressPercentage');
      
      if (progressFilled && progressPercentage) {
        // 设置进度条的宽度百分比
        progressFilled.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
      }
    }
    
    updateButtonVisibility() {
      if (!this.section) return;
      
      const createBtn = this.section.querySelector('#countdownCreateBtn');
      const editBtn = this.section.querySelector('#countdownEditBtn');
      const backBtn = this.section.querySelector('#countdownBackBtn');
      const saveBtn = this.section.querySelector('#countdownSaveBtn');
      const exportAllBtn = this.section.querySelector('#countdownExportAllBtn');
      
      // 默认页：显示"体验制作"按钮
      // 编辑页：显示"返回"、"保存"、"导出全部"按钮
      // 用户内容页：显示"返回"、"编辑"、"导出全部"按钮
      if (this.isEditMode) {
        // 编辑模式
        if (createBtn) createBtn.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        if (backBtn) backBtn.style.display = 'inline-block';
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (exportAllBtn) exportAllBtn.style.display = 'inline-block';
      } else {
        // 非编辑模式
        if (this.currentData && this.currentData.isDefault) {
          // 默认页
          if (createBtn) createBtn.style.display = 'inline-block';
          if (editBtn) editBtn.style.display = 'none';
          if (backBtn) backBtn.style.display = 'none';
          if (saveBtn) saveBtn.style.display = 'none';
          if (exportAllBtn) exportAllBtn.style.display = 'none';
        } else {
          // 用户内容页
          if (createBtn) createBtn.style.display = 'none';
          if (editBtn) editBtn.style.display = 'inline-block';
          if (backBtn) backBtn.style.display = 'inline-block';
          if (saveBtn) saveBtn.style.display = 'none';
          if (exportAllBtn) exportAllBtn.style.display = 'inline-block';
        }
      }
    }

    renderEditMode() {
      if (!this.section) return;
      
      const form = this.section.querySelector('#countdownForm');
      if (!form) return;
      
      // 填充表单
      const birthDateInput = this.section.querySelector('#countdownBirthDate');
      const lifespanInput = this.section.querySelector('#countdownExpectedLifespan');
      const deathMonthInput = this.section.querySelector('#countdownDeathMonth');
      const deathDayInput = this.section.querySelector('#countdownDeathDay');
      
      if (birthDateInput) birthDateInput.value = this.currentData.birthDate;
      if (lifespanInput) lifespanInput.value = this.currentData.expectedLifespan;
      if (deathMonthInput) deathMonthInput.value = this.currentData.deathMonth || 1;
      if (deathDayInput) deathDayInput.value = this.currentData.deathDay || 1;
      
      // 渲染活动列表
      this.renderActivitiesEdit();
      
      // 渲染想做的事情列表
      this.renderTodoListEdit(true);
    }

    renderActivitiesEdit() {
      if (!this.section) return;
      
      const container = this.section.querySelector('#countdownActivitiesEdit');
      if (!container) return;
      
      const activities = this.currentData.activities || [];
      let html = '';
      
      activities.forEach((activity, index) => {
        html += `
          <div class="countdown-activity-item" data-index="${index}">
            <div class="countdown-form-group">
              <label>活动名称：</label>
              <input type="text" class="countdown-input activity-name" value="${activity.name || ''}" placeholder="例如：阅读">
            </div>
            <div class="countdown-form-group">
              <label>频率：</label>
              <input type="number" class="countdown-input activity-freq-value" value="${activity.frequency?.value || 1}" min="1">
              <select class="countdown-input activity-freq-unit">
                <option value="day" ${activity.frequency?.unit === 'day' ? 'selected' : ''}>天</option>
                <option value="week" ${activity.frequency?.unit === 'week' ? 'selected' : ''}>周</option>
                <option value="month" ${activity.frequency?.unit === 'month' ? 'selected' : ''}>月</option>
                <option value="year" ${activity.frequency?.unit === 'year' ? 'selected' : ''}>年</option>
              </select>
            </div>
            <div class="countdown-form-group">
              <label>每次时长（小时）：</label>
              <input type="number" class="countdown-input activity-duration" value="${activity.duration || 1}" min="0.1" step="0.1">
            </div>
            <button type="button" class="countdown-btn countdown-btn-remove">删除</button>
          </div>
        `;
      });
      
      container.innerHTML = html;
    }

    renderTodoListEdit(isEditMode = true) {
      if (!this.section) return;
      
      const container = this.section.querySelector('#countdownTodoListEdit');
      if (!container) return;
      
      const todoList = this.currentData.todoList || [];
      const maxItemsPerColumn = 10;
      
      // 计算需要的列数：每列最多10个实际项
      // 如果是只读模式，不需要空单元格
      const totalColumns = isEditMode 
        ? Math.max(1, Math.ceil((todoList.length + 1) / maxItemsPerColumn)) // +1 是为了空单元格
        : Math.max(1, Math.ceil(todoList.length / maxItemsPerColumn));
      
      let html = '<div class="countdown-todo-table-edit-wrapper"><div class="countdown-todo-table-edit">';
      
      for (let col = 0; col < totalColumns; col++) {
        html += '<div class="countdown-todo-column">';
        
        // 填充该列的所有单元格
        const startIndex = col * maxItemsPerColumn;
        const endIndex = Math.min(startIndex + maxItemsPerColumn, todoList.length);
        
        for (let itemIndex = startIndex; itemIndex < endIndex; itemIndex++) {
          const todo = todoList[itemIndex];
          const row = itemIndex - startIndex;
          const hasText = todo.text && todo.text.trim() !== '';
          
          if (isEditMode) {
            // 编辑模式：如果有文本，显示为普通文本（可点击编辑），否则显示输入框
            if (hasText) {
              // 将文本按每10个字符换行
              const text = todo.text || '';
              const wrappedText = this.wrapTextByChars(text, 10);
              html += `
                <div class="countdown-todo-cell" data-col="${col}" data-row="${row}" data-index="${itemIndex}">
                  <span class="countdown-todo-number">${todo.id || (itemIndex + 1)}.</span>
                  <span class="countdown-todo-text" data-index="${itemIndex}">${wrappedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                  <button type="button" class="countdown-todo-remove" data-index="${itemIndex}" title="删除">×</button>
                </div>
              `;
            } else {
              html += `
                <div class="countdown-todo-cell" data-col="${col}" data-row="${row}" data-index="${itemIndex}">
                  <span class="countdown-todo-number">${todo.id || (itemIndex + 1)}.</span>
                  <input type="text" class="countdown-todo-input" value="${(todo.text || '').replace(/"/g, '&quot;')}" placeholder="想做的事情" data-index="${itemIndex}">
                  <button type="button" class="countdown-todo-remove" data-index="${itemIndex}" title="删除">×</button>
                </div>
              `;
            }
          } else {
            // 只读模式：只显示文本，不显示按钮和输入框
            if (hasText) {
              const text = todo.text || '';
              const wrappedText = this.wrapTextByChars(text, 10);
              html += `
                <div class="countdown-todo-cell" data-col="${col}" data-row="${row}" data-index="${itemIndex}">
                  <span class="countdown-todo-number">${todo.id || (itemIndex + 1)}.</span>
                  <span class="countdown-todo-text">${wrappedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                </div>
              `;
            }
          }
        }
        
        // 编辑模式：如果该列还没满10个，在最后添加一个空单元格（占位符）
        if (isEditMode) {
          const itemsInColumn = endIndex - startIndex;
          if (itemsInColumn < maxItemsPerColumn) {
            const emptyIndex = -1;
            html += `
              <div class="countdown-todo-cell" data-col="${col}" data-row="${itemsInColumn}" data-index="${emptyIndex}">
                <span class="countdown-todo-number"></span>
                <input type="text" class="countdown-todo-input" placeholder="添加想做的...." data-index="${emptyIndex}">
              </div>
            `;
          }
          
          // 每列底部添加按钮（只有该列未满10个时才显示）
          if (itemsInColumn < maxItemsPerColumn) {
            html += `
              <button type="button" class="countdown-todo-add-column" data-col="${col}" title="添加新项">+</button>
            `;
          }
        }
        
        html += '</div>';
      }
      
      html += '</div></div>';
      container.innerHTML = html;
    }
    
    bindTodoEditEvents() {
      if (!this.section) return;
      
      const container = this.section.querySelector('#countdownTodoListEdit');
      if (!container) return;
      
      // 如果已经绑定过事件，直接返回（避免重复绑定）
      if (this.todoEditEventsBound) {
        return;
      }
      this.todoEditEventsBound = true;
      
      // 输入框变化事件（使用change事件，在失去焦点时触发，避免频繁触发）
      container.addEventListener('blur', (e) => {
        if (e.target.classList.contains('countdown-todo-input')) {
          const index = parseInt(e.target.dataset.index);
          const value = e.target.value.trim();
          
          if (index === -1) {
            // 空单元格，创建新项
            if (value) {
              if (!this.currentData.todoList) {
                this.currentData.todoList = [];
              }
              const maxId = this.currentData.todoList.length > 0
                ? Math.max(...this.currentData.todoList.map(t => t.id))
                : 0;
              this.currentData.todoList.push({
                id: maxId + 1,
                text: value
              });
              // 重新渲染
              this.renderTodoListEdit(true);
              this.saveData();
            }
          } else {
            // 更新现有项
            if (this.currentData.todoList && this.currentData.todoList[index]) {
              this.currentData.todoList[index].text = value;
              this.saveData();
            }
          }
        }
      }, true); // 使用捕获阶段
      
      // 输入框回车事件（立即创建）
      container.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('countdown-todo-input') && e.key === 'Enter') {
          e.preventDefault();
          const index = parseInt(e.target.dataset.index);
          const value = e.target.value.trim();
          
          if (index === -1 && value) {
            // 空单元格，创建新项
            if (!this.currentData.todoList) {
              this.currentData.todoList = [];
            }
            const maxId = this.currentData.todoList.length > 0
              ? Math.max(...this.currentData.todoList.map(t => t.id))
              : 0;
            this.currentData.todoList.push({
              id: maxId + 1,
              text: value
            });
            // 重新渲染
            this.renderTodoListEdit(true);
            this.saveData();
          } else if (index >= 0 && value) {
            // 更新现有项，重新渲染以显示为文本
            if (this.currentData.todoList && this.currentData.todoList[index]) {
              this.currentData.todoList[index].text = value;
              this.renderTodoListEdit(true);
              this.saveData();
            }
          }
        }
      });
      
      // 文本点击事件（点击文本时切换为编辑模式）
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('countdown-todo-text')) {
          const index = parseInt(e.target.dataset.index);
          if (this.currentData.todoList && this.currentData.todoList[index]) {
            // 将文本清空，切换为编辑模式
            this.currentData.todoList[index].text = '';
            this.renderTodoListEdit(true);
            // 聚焦到对应的输入框
            setTimeout(() => {
              const input = container.querySelector(`input[data-index="${index}"]`);
              if (input) {
                input.focus();
              }
            }, 0);
          }
        }
      });
      
      // 删除按钮事件
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('countdown-todo-remove')) {
          e.preventDefault();
          e.stopPropagation();
          const index = parseInt(e.target.dataset.index);
          if (this.currentData.todoList && this.currentData.todoList[index]) {
            this.currentData.todoList.splice(index, 1);
            // 重新分配ID，确保连续
            this.currentData.todoList.forEach((todo, idx) => {
              todo.id = idx + 1;
            });
            this.renderTodoListEdit(true);
            this.saveData();
          }
        }
      });
      
      // 添加按钮事件
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('countdown-todo-add-column')) {
          e.preventDefault();
          e.stopPropagation();
          if (!this.currentData.todoList) {
            this.currentData.todoList = [];
          }
          const maxId = this.currentData.todoList.length > 0
            ? Math.max(...this.currentData.todoList.map(t => t.id))
            : 0;
          this.currentData.todoList.push({
            id: maxId + 1,
            text: ''
          });
          this.renderTodoListEdit(true);
          this.saveData();
        }
      });
    }

    enterEditMode() {
      if (!this.section) return;
      
      this.isEditMode = true;
      // 点击"体验制作"后，将 isDefault 设置为 false，允许编辑
      if (this.currentData.isDefault) {
        this.currentData.isDefault = false;
        // 清空示例数据，让用户从空白开始
        this.currentData.todoList = [];
      }
      
      // 设置 body 的 data-edit-mode 属性，用于 CSS 控制显示/隐藏
      document.body.setAttribute('data-edit-mode', 'true');
      
      const displayMode = this.section.querySelector('#countdownDisplayMode');
      const editMode = this.section.querySelector('#countdownEditMode');
      const reflectionEdit = this.section.querySelector('#countdownReflectionEdit');
      
      // 保持显示模式可见，隐藏传统编辑模式
      if (displayMode) displayMode.style.display = 'block';
      if (editMode) editMode.style.display = 'none';
      
      // 按钮显示由 updateButtonVisibility() 统一管理
      this.updateButtonVisibility();
      
      // 显示反思文本输入框
      if (reflectionEdit) {
        reflectionEdit.style.display = 'block';
        // 加载已保存的反思文本
        const reflectionText = this.section.querySelector('#countdownReflectionText');
        if (reflectionText) {
          if (this.currentData.reflection) {
            reflectionText.value = this.currentData.reflection;
          }
          // 调整高度以适应内容（延迟执行，确保内容已加载）
          setTimeout(() => {
            if (reflectionText && reflectionText.scrollHeight > 0) {
              reflectionText.style.height = 'auto';
              reflectionText.style.height = reflectionText.scrollHeight + 'px';
            }
          }, 100);
        }
      }
      
      // 将显示模式中的数字部分改为可编辑的输入框
      this.enableInlineEditing();
      
      // 重新渲染图表以显示添加按钮
      this.renderCanvas();
      
      // 更新活动显示为编辑表单（确保所有活动都显示为编辑表单）
      this.updateActivitiesDisplay();

      // 渲染想做的事情编辑列表
      this.renderTodoListEdit(true);
      
      // 绑定想做的事情编辑事件（只在进入编辑模式时绑定一次）
      this.bindTodoEditEvents();

      // 绑定反思文本相关事件
      this.bindReflectionEvents();
      
      // 显示并绑定导出生命周历按钮事件
      const exportWeekChartBtn = this.section.querySelector('#countdownExportWeekChartBtn');
      if (exportWeekChartBtn) {
        exportWeekChartBtn.style.display = 'inline-block';
        exportWeekChartBtn.addEventListener('click', () => {
          this.exportWeekChart();
        });
      }
      
      // 显示并绑定导出人生阶段图按钮事件
      const exportLifeStageChartBtn = this.section.querySelector('#countdownExportLifeStageChartBtn');
      if (exportLifeStageChartBtn) {
        exportLifeStageChartBtn.style.display = 'inline-block';
        exportLifeStageChartBtn.addEventListener('click', () => {
          this.exportLifeStageChart();
        });
      }
      
      // 显示并绑定导出想做的事按钮事件
      const exportTodoListBtn = this.section.querySelector('#countdownExportTodoListBtn');
      if (exportTodoListBtn) {
        exportTodoListBtn.style.display = 'block';
        exportTodoListBtn.addEventListener('click', () => {
          this.exportTodoList();
        });
      }
    }

    exitEditMode() {
      if (!this.section) return;
      
      this.isEditMode = false;
      // 移除 body 的 data-edit-mode 属性
      document.body.removeAttribute('data-edit-mode');
      
      // 隐藏导出生命周历按钮
      const exportWeekChartBtn = this.section.querySelector('#countdownExportWeekChartBtn');
      if (exportWeekChartBtn) {
        exportWeekChartBtn.style.display = 'none';
      }
      
      // 隐藏导出人生阶段图按钮
      const exportLifeStageChartBtn = this.section.querySelector('#countdownExportLifeStageChartBtn');
      if (exportLifeStageChartBtn) {
        exportLifeStageChartBtn.style.display = 'none';
      }
      
      // 隐藏导出想做的事按钮
      const exportTodoListBtn = this.section.querySelector('#countdownExportTodoListBtn');
      if (exportTodoListBtn) {
        exportTodoListBtn.style.display = 'none';
      }
      
      // 隐藏反思文本输入框
      const reflectionEdit = this.section.querySelector('#countdownReflectionEdit');
      if (reflectionEdit) {
        reflectionEdit.style.display = 'none';
      }
      
      // 保存反思文本（退出编辑模式时自动保存）
      const reflectionText = this.section.querySelector('#countdownReflectionText');
      if (reflectionText) {
        this.currentData.reflection = reflectionText.value;
        this.saveData();
      }
      
      const displayMode = this.section.querySelector('#countdownDisplayMode');
      const editMode = this.section.querySelector('#countdownEditMode');
      
      if (displayMode) displayMode.style.display = 'block';
      if (editMode) editMode.style.display = 'none';
      
      // 恢复显示模式，移除内联编辑输入框
      this.disableInlineEditing();
      
      // 重新渲染以更新显示
      this.render();
      
      // 更新按钮显示（统一管理）
      this.updateButtonVisibility();
    }

    enableInlineEditing() {
      if (!this.section) return;
      
      // 保存原始内容，以便退出编辑模式时恢复
      this.originalDisplayContent = {};
      
      // 1. 出生日期 - 改为日期输入框
      const birthDateDisplay = this.section.querySelector('#countdownBirthDateDisplay');
      if (birthDateDisplay && !birthDateDisplay.dataset.editing) {
        this.originalDisplayContent.birthDate = birthDateDisplay.innerHTML;
        const birthDate = this.currentData.birthDate;
        const input = document.createElement('input');
        input.type = 'date';
        input.value = birthDate;
        input.className = 'countdown-inline-input countdown-inline-input-date';
        input.dataset.field = 'birthDate';
        birthDateDisplay.innerHTML = '';
        birthDateDisplay.appendChild(input);
        birthDateDisplay.dataset.editing = 'true';
        
        // 实时更新
        input.addEventListener('change', () => {
          this.currentData.birthDate = input.value;
          this.updateDisplayAndCharts();
        });
      }
      
      // 2. 预期寿命 - 改为数字输入框
      const lifespanDisplay = this.section.querySelector('#countdownLifespanDisplay');
      if (lifespanDisplay && !lifespanDisplay.dataset.editing) {
        this.originalDisplayContent.lifespan = lifespanDisplay.innerHTML;
        const lifespan = this.currentData.expectedLifespan;
        const input = document.createElement('input');
        input.type = 'number';
        input.value = lifespan;
        input.min = 1;
        input.max = 150;
        input.className = 'countdown-inline-input countdown-inline-input-number';
        input.dataset.field = 'expectedLifespan';
        const span = document.createElement('span');
        span.textContent = '岁';
        span.style.fontWeight = 'bold';
        span.style.color = '#000';
        lifespanDisplay.innerHTML = '';
        lifespanDisplay.appendChild(input);
        lifespanDisplay.appendChild(span);
        lifespanDisplay.dataset.editing = 'true';
        
        // 实时更新
        input.addEventListener('change', () => {
          this.currentData.expectedLifespan = parseInt(input.value) || 80;
          this.updateDisplayAndCharts();
        });
      }
      
      // 3. 死亡日期（月日）- 改为两个数字输入框
      const deathDateDisplay = this.section.querySelector('#countdownDeathDateDisplay');
      if (deathDateDisplay && !deathDateDisplay.dataset.editing) {
        this.originalDisplayContent.deathDate = deathDateDisplay.innerHTML;
        const deathMonth = this.currentData.deathMonth || 1;
        const deathDay = this.currentData.deathDay || 1;
        
        const monthInput = document.createElement('input');
        monthInput.type = 'number';
        monthInput.value = deathMonth;
        monthInput.min = 1;
        monthInput.max = 12;
        monthInput.className = 'countdown-inline-input countdown-inline-input-number';
        monthInput.dataset.field = 'deathMonth';
        
        const dayInput = document.createElement('input');
        dayInput.type = 'number';
        dayInput.value = deathDay;
        dayInput.min = 1;
        dayInput.max = 31;
        dayInput.className = 'countdown-inline-input countdown-inline-input-number';
        dayInput.dataset.field = 'deathDay';
        
        const monthSpan = document.createElement('span');
        monthSpan.textContent = '月';
        monthSpan.style.fontWeight = 'bold';
        monthSpan.style.color = '#000';
        monthSpan.style.marginRight = '4px';
        
        const daySpan = document.createElement('span');
        daySpan.textContent = '日';
        daySpan.style.fontWeight = 'bold';
        daySpan.style.color = '#000';
        
        deathDateDisplay.innerHTML = '';
        deathDateDisplay.appendChild(monthInput);
        deathDateDisplay.appendChild(monthSpan);
        deathDateDisplay.appendChild(dayInput);
        deathDateDisplay.appendChild(daySpan);
        deathDateDisplay.dataset.editing = 'true';
        
        // 实时更新
        const updateDeathDate = () => {
          this.currentData.deathMonth = parseInt(monthInput.value) || 1;
          this.currentData.deathDay = parseInt(dayInput.value) || 1;
          this.updateDisplayAndCharts();
        };
        monthInput.addEventListener('change', updateDeathDate);
        dayInput.addEventListener('change', updateDeathDate);
      }
    }
    
    disableInlineEditing() {
      if (!this.section) return;
      
      // 恢复原始显示内容
      if (this.originalDisplayContent) {
        const birthDateDisplay = this.section.querySelector('#countdownBirthDateDisplay');
        if (birthDateDisplay && this.originalDisplayContent.birthDate) {
          birthDateDisplay.innerHTML = this.originalDisplayContent.birthDate;
          delete birthDateDisplay.dataset.editing;
        }
        
        const lifespanDisplay = this.section.querySelector('#countdownLifespanDisplay');
        if (lifespanDisplay && this.originalDisplayContent.lifespan) {
          lifespanDisplay.innerHTML = this.originalDisplayContent.lifespan;
          delete lifespanDisplay.dataset.editing;
        }
        
        const deathDateDisplay = this.section.querySelector('#countdownDeathDateDisplay');
        if (deathDateDisplay && this.originalDisplayContent.deathDate) {
          deathDateDisplay.innerHTML = this.originalDisplayContent.deathDate;
          delete deathDateDisplay.dataset.editing;
        }
      }
      
      this.originalDisplayContent = {};
    }
    
    updateDisplayAndCharts() {
      // 更新文本显示
      this.updateTextDisplay();
      // 更新进度条
      this.updateProgressBar();
      // 更新活动显示
      this.updateActivitiesDisplay();
      // 更新图表
      this.renderCanvas();
    }

    saveFromForm() {
      if (!this.section) return;
      
      // 从内联编辑输入框获取数据
      const birthDateInput = this.section.querySelector('#countdownBirthDateDisplay input[data-field="birthDate"]');
      if (birthDateInput) {
        this.currentData.birthDate = birthDateInput.value;
      }
      
      const lifespanInput = this.section.querySelector('#countdownLifespanDisplay input[data-field="expectedLifespan"]');
      if (lifespanInput) {
        this.currentData.expectedLifespan = parseInt(lifespanInput.value) || 80;
      }
      
      const deathMonthInput = this.section.querySelector('#countdownDeathDateDisplay input[data-field="deathMonth"]');
      if (deathMonthInput) {
        this.currentData.deathMonth = parseInt(deathMonthInput.value) || 1;
      }
      
      const deathDayInput = this.section.querySelector('#countdownDeathDateDisplay input[data-field="deathDay"]');
      if (deathDayInput) {
        this.currentData.deathDay = parseInt(deathDayInput.value) || 1;
      }
      
      // 保存反思文本
      const reflectionText = this.section.querySelector('#countdownReflectionText');
      if (reflectionText) {
        this.currentData.reflection = reflectionText.value;
      }
      
      // 保存数据
      this.saveData().then(() => {
        // 退出编辑模式
        this.exitEditMode();
      });
    }
    
    saveFromFormOld() {
      if (!this.section) return;
      
      const form = this.section.querySelector('#countdownForm');
      if (!form) return;
      
      // 收集表单数据
      const birthDate = this.section.querySelector('#countdownBirthDate').value;
      const expectedLifespan = parseInt(this.section.querySelector('#countdownExpectedLifespan').value);
      const deathMonth = parseInt(this.section.querySelector('#countdownDeathMonth').value);
      const deathDay = parseInt(this.section.querySelector('#countdownDeathDay').value);
      
      // 收集活动数据
      const activityItems = this.section.querySelectorAll('.countdown-activity-item');
      const activities = Array.from(activityItems).map(item => {
        return {
          id: Date.now() + Math.random(),
          name: item.querySelector('.activity-name').value,
          frequency: {
            value: parseInt(item.querySelector('.activity-freq-value').value),
            unit: item.querySelector('.activity-freq-unit').value
          },
          duration: parseFloat(item.querySelector('.activity-duration').value)
        };
      });
      
      // 收集待办事项
      const todoItems = this.section.querySelectorAll('.countdown-todo-item');
      const todoList = Array.from(todoItems).map((item, index) => {
        return {
          id: index + 1,
          text: item.querySelector('.todo-text').value
        };
      }).filter(todo => todo.text.trim() !== '');
      
      // 更新数据
      this.currentData = {
        ...this.currentData,
        birthDate,
        expectedLifespan,
        deathMonth,
        deathDay,
        activities,
        todoList,
        isDefault: false,
        lastModified: new Date().toISOString()
      };
      
      this.saveData().then(() => {
        this.render();
        this.exitEditMode();
        // 保存后，数据不再是默认数据，更新按钮显示
        this.currentData.isDefault = false;
        this.updateButtonVisibility();
      });
    }

    addActivity() {
      if (!this.currentData.activities) {
        this.currentData.activities = [];
      }
      this.currentData.activities.push({
        id: Date.now(),
        name: '',
        frequency: { value: 1, unit: 'day' },
        duration: 1
      });
      this.renderActivitiesEdit();
    }

    removeActivity(index) {
      if (this.currentData.activities && this.currentData.activities[index]) {
        this.currentData.activities.splice(index, 1);
        // 保存数据
        this.saveData().then(() => {
          // 更新显示
          this.updateActivitiesDisplay();
        });
      }
    }

    addTodo() {
      if (!this.currentData.todoList) {
        this.currentData.todoList = [];
      }
      const maxId = this.currentData.todoList.length > 0
        ? Math.max(...this.currentData.todoList.map(t => t.id))
        : 0;
      this.currentData.todoList.push({
        id: maxId + 1,
        text: ''
      });
      this.renderTodoListEdit(true);
    }

    removeTodo(index) {
      if (this.currentData.todoList && this.currentData.todoList[index]) {
        this.currentData.todoList.splice(index, 1);
        this.renderTodoListEdit(true);
      }
    }

    exportToImage() {
      if (!this.section) return;
      
      if (typeof html2canvas === 'undefined') {
        alert('html2canvas库未加载，无法导出图片');
        return;
      }
      
      const content = this.section.querySelector('#countdownDisplayMode');
      if (!content) return;
      
      html2canvas(content, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = '人生倒计时.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error('导出图片失败:', err);
        alert('导出图片失败，请重试');
      });
    }
    
    exportWeekChart() {
      if (!this.section) return;
      
      if (typeof html2canvas === 'undefined') {
        alert('html2canvas库未加载，无法导出图片');
        return;
      }
      
      const weekChartCanvas = this.section.querySelector('#countdownWeekChart');
      if (!weekChartCanvas) {
        alert('未找到生命周历图表');
        return;
      }
      
      // 获取按钮，添加选中效果
      const btn = this.section.querySelector('#countdownExportWeekChartBtn');
      if (btn) {
        btn.classList.add('active');
        setTimeout(() => {
          btn.classList.remove('active');
        }, 300);
      }
      
      // 将 Canvas 转换为图片
      try {
        const dataURL = weekChartCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = '生命周历.png';
        link.href = dataURL;
        link.click();
      } catch (err) {
        console.error('导出生命周历失败:', err);
        alert('导出生命周历失败，请重试');
      }
    }
    
    exportLifeStageChart() {
      if (!this.section) return;
      
      const lifeStageCanvas = this.section.querySelector('#countdownLifeStageChart');
      if (!lifeStageCanvas) {
        alert('未找到人生阶段图');
        return;
      }
      
      // 获取按钮，添加选中效果
      const btn = this.section.querySelector('#countdownExportLifeStageChartBtn');
      if (btn) {
        btn.classList.add('active');
        setTimeout(() => {
          btn.classList.remove('active');
        }, 300);
      }
      
      // 将 Canvas 转换为图片
      try {
        const dataURL = lifeStageCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = '人生阶段图.png';
        link.href = dataURL;
        link.click();
      } catch (err) {
        console.error('导出人生阶段图失败:', err);
        alert('导出人生阶段图失败，请重试');
      }
    }
    
    exportTodoList() {
      if (!this.section) return;
      
      if (typeof html2canvas === 'undefined') {
        alert('html2canvas库未加载，无法导出图片');
        return;
      }
      
      // 获取按钮，添加选中效果
      const btn = this.section.querySelector('#countdownExportTodoListBtn');
      if (btn) {
        btn.classList.add('active');
        setTimeout(() => {
          btn.classList.remove('active');
        }, 300);
      }
      
      // 获取想做的事情表格容器
      const todoListEdit = this.section.querySelector('#countdownTodoListEdit');
      if (!todoListEdit) {
        alert('未找到想做的事情表格');
        return;
      }
      
      // 使用 html2canvas 导出表格
      html2canvas(todoListEdit, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = '想做的事.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error('导出想做的事失败:', err);
        alert('导出想做的事失败，请重试');
      });
    }

    exportToExcel() {
      if (typeof XLSX === 'undefined') {
        alert('SheetJS库未加载，无法导出Excel');
        return;
      }
      
      const calculated = this.calculateAll();
      const { currentAge, remainingTime, deathYear, deathDate, activities } = calculated;
      
      const data = [
        ['人生倒计时数据'],
        [],
        ['出生日期', this.currentData.birthDate],
        ['预期寿命', `${this.currentData.expectedLifespan}岁`],
        ['死亡日期', `${deathYear}年${deathDate.getMonth() + 1}月${deathDate.getDate()}日`],
        [],
        ['当前年龄'],
        ['年', currentAge.years],
        ['月', currentAge.months],
        ['周', currentAge.weeks],
        ['天', currentAge.days],
        ['小时', currentAge.hours],
        ['分钟', currentAge.minutes],
        [],
        ['剩余时间'],
        ['年', remainingTime.years],
        ['月', remainingTime.months],
        ['周', remainingTime.weeks],
        ['天', remainingTime.days],
        ['小时', remainingTime.hours],
        ['分钟', remainingTime.minutes],
        [],
        ['活动计算']
      ];
      
      if (activities.length > 0) {
        data.push(['活动名称', '频率', '每次时长(小时)', '剩余次数', '总时长(小时)']);
        activities.forEach(activity => {
          const freqText = `${activity.frequency.value}${activity.frequency.unit === 'day' ? '天' : activity.frequency.unit === 'week' ? '周' : activity.frequency.unit === 'month' ? '月' : '年'}`;
          data.push([
            activity.name,
            freqText,
            activity.duration,
            activity.calculated.times,
            activity.calculated.totalHours
          ]);
        });
      }
      
      data.push([], ['想做的事情']);
      if (this.currentData.todoList && this.currentData.todoList.length > 0) {
        data.push(['序号', '内容']);
        this.currentData.todoList.forEach(todo => {
          data.push([todo.id, todo.text]);
        });
      }
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '人生倒计时');
      
      XLSX.writeFile(wb, '人生倒计时.xlsx');
    }
    
    async exportAll() {
      if (!this.section) return;
      
      if (typeof JSZip === 'undefined') {
        alert('JSZip库未加载，无法导出压缩包');
        return;
      }
      
      if (typeof html2canvas === 'undefined') {
        alert('html2canvas库未加载，无法导出图片');
        return;
      }
      
      try {
        const zip = new JSZip();
        
        // 1. 导出文本内容为HTML
        const displayMode = this.section.querySelector('#countdownDisplayMode');
        if (displayMode) {
          // 创建文本内容的HTML
          let htmlContent = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>人生倒计时</title>\n</head>\n<body>\n';
          htmlContent += displayMode.innerHTML;
          htmlContent += '\n</body>\n</html>';
          zip.file('人生倒计时.html', htmlContent);
        }
        
        // 2. 导出生命周历图
        const weekChartCanvas = this.section.querySelector('#countdownWeekChart');
        if (weekChartCanvas) {
          const weekChartDataURL = weekChartCanvas.toDataURL('image/png');
          const weekChartBase64 = weekChartDataURL.split(',')[1];
          zip.file('生命周历.png', weekChartBase64, { base64: true });
        }
        
        // 3. 导出人生阶段图
        const lifeStageCanvas = this.section.querySelector('#countdownLifeStageChart');
        if (lifeStageCanvas) {
          const lifeStageDataURL = lifeStageCanvas.toDataURL('image/png');
          const lifeStageBase64 = lifeStageDataURL.split(',')[1];
          zip.file('人生阶段图.png', lifeStageBase64, { base64: true });
        }
        
        // 4. 导出想做的事表格
        const todoListEdit = this.section.querySelector('#countdownTodoListEdit');
        const todoTableCanvas = this.section.querySelector('#countdownTodoTable');
        
        if (todoListEdit && todoListEdit.children.length > 0) {
          // 如果有编辑模式的表格，使用html2canvas导出
          const todoCanvas = await html2canvas(todoListEdit, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          const todoDataURL = todoCanvas.toDataURL('image/png');
          const todoBase64 = todoDataURL.split(',')[1];
          zip.file('想做的事.png', todoBase64, { base64: true });
        } else if (todoTableCanvas) {
          // 否则使用canvas导出
          const todoDataURL = todoTableCanvas.toDataURL('image/png');
          const todoBase64 = todoDataURL.split(',')[1];
          zip.file('想做的事.png', todoBase64, { base64: true });
        }
        
        // 生成并下载压缩包
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = '人生倒计时.zip';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        
      } catch (err) {
        console.error('导出全部失败:', err);
        alert('导出全部失败，请重试');
      }
    }

    setupEventListeners() {
      if (!this.section) return;
      
      // 编辑按钮
      const editBtn = this.section.querySelector('#countdownEditBtn');
      if (editBtn) {
        editBtn.addEventListener('click', () => this.enterEditMode());
      }
      
      // 保存按钮
      const saveBtn = this.section.querySelector('#countdownSaveBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveFromForm());
      }
      
      // 返回按钮
      const backBtn = this.section.querySelector('#countdownBackBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          // 如果是在编辑模式，返回时退出编辑模式
          if (this.isEditMode) {
            // 如果是从默认数据进入编辑，返回时重置为默认数据
            if (this.currentData.isDefault) {
              this.loadData();
            } else {
              // 如果是用户数据，返回时退出编辑模式，显示用户内容
              this.exitEditMode();
            }
          } else {
            // 如果是在用户内容页，返回时重置为默认数据
            this.loadData();
          }
          this.render();
        });
      }
      
      // 导出全部按钮
      const exportAllBtn = this.section.querySelector('#countdownExportAllBtn');
      if (exportAllBtn) {
        exportAllBtn.addEventListener('click', () => this.exportAll());
      }
      
      // 添加活动按钮
      const addActivityBtn = this.section.querySelector('#countdownAddActivityBtn');
      if (addActivityBtn) {
        addActivityBtn.addEventListener('click', () => this.addActivity());
      }
      
      // 添加待办按钮
      const addTodoBtn = this.section.querySelector('#countdownAddTodoBtn');
      if (addTodoBtn) {
        addTodoBtn.addEventListener('click', () => this.addTodo());
      }
      
      // 体验制作按钮
      const createBtn = this.section.querySelector('#countdownCreateBtn');
      if (createBtn) {
        createBtn.addEventListener('click', () => this.enterEditMode());
      }
      
      // 绑定反思文本相关事件（在初始化时绑定，但按钮只在编辑模式下显示）
      // 注意：bindReflectionEvents 会在 enterEditMode 中再次调用，这里先不调用
      // this.bindReflectionEvents();
      
      // 动态事件委托（删除按钮）
      const activitiesEdit = this.section.querySelector('#countdownActivitiesEdit');
      if (activitiesEdit) {
        activitiesEdit.addEventListener('click', (e) => {
          if (e.target.classList.contains('countdown-btn-remove')) {
            const item = e.target.closest('.countdown-activity-item');
            if (item) {
              const index = parseInt(item.dataset.index);
              this.removeActivity(index);
            }
          }
        });
      }
      
      const todoListEdit = this.section.querySelector('#countdownTodoListEdit');
      if (todoListEdit) {
        todoListEdit.addEventListener('click', (e) => {
          if (e.target.classList.contains('countdown-btn-remove')) {
            const item = e.target.closest('.countdown-todo-item');
            if (item) {
              const index = parseInt(item.dataset.index);
              this.removeTodo(index);
            }
          }
        });
      }
    }
    
    bindReflectionEvents() {
      if (!this.section) return;
      
      const reflectionText = this.section.querySelector('#countdownReflectionText');
      if (!reflectionText) return;
      
      // 如果已经绑定过事件，先移除旧的事件监听器
      if (reflectionText.dataset.bound === 'true') {
        return; // 已经绑定过，避免重复绑定
      }
      reflectionText.dataset.bound = 'true';
      
      // 自动调整文本输入框高度
      // 调整高度的函数（使用防抖避免频繁触发）
      let heightAdjustTimeout;
      let isAdjusting = false; // 防止递归调用
      const adjustTextareaHeight = () => {
        if (isAdjusting) return; // 如果正在调整，直接返回
        clearTimeout(heightAdjustTimeout);
        heightAdjustTimeout = setTimeout(() => {
          if (reflectionText && reflectionText.scrollHeight > 0 && !isAdjusting) {
            isAdjusting = true;
            try {
              const currentHeight = reflectionText.style.height;
              reflectionText.style.height = 'auto';
              const newHeight = reflectionText.scrollHeight + 'px';
              // 只有当高度确实需要改变时才设置
              if (currentHeight !== newHeight) {
                reflectionText.style.height = newHeight;
              }
            } finally {
              isAdjusting = false;
            }
          }
        }, 10);
      };
      
      // 监听输入事件，实时调整高度
      reflectionText.addEventListener('input', adjustTextareaHeight);
      
      // 初始化时调整高度（延迟执行，确保 DOM 已渲染）
      setTimeout(adjustTextareaHeight, 100);
      
      // 失去焦点时自动保存
      reflectionText.addEventListener('blur', () => {
        if (reflectionText) {
          this.currentData.reflection = reflectionText.value;
          this.saveData();
        }
      });
    }
  };

})();

