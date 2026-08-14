import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../models/health_news_model.dart';
import '../../models/vital_chart_model.dart';
import '../../view_models/home_viewmodel.dart';

// ============================================================
//  HomeView — redesigned
// ============================================================

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HomeViewModel()..load(),
      child: const _HomeScaffold(),
    );
  }
}

// ── Scaffold ─────────────────────────────────────────────────────────────────

class _HomeScaffold extends StatelessWidget {
  const _HomeScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<HomeViewModel>();

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: vm.isLoading
            ? const Center(child: CircularProgressIndicator())
            : _HomeBody(vm: vm),
      ),
    );
  }
}

// ── Body ─────────────────────────────────────────────────────────────────────

class _HomeBody extends StatelessWidget {
  final HomeViewModel vm;
  const _HomeBody({required this.vm});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(child: _HomeHeader(vm: vm)),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 32),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // Hero card
              _NextAppointmentHeroCard(vm: vm),
              const SizedBox(height: 28),

              // Vital signs chart
              _SectionLabel(label: 'Ch\u1ec9 s\u1ed1 sinh t\u1ed3n'),
              const SizedBox(height: 14),
              _VitalSignsChartCard(vm: vm),
              const SizedBox(height: 28),

              // Health news
              _SectionLabel(label: 'Tin t\u1ee9c s\u1ee9c kh\u1ecfe'),
              const SizedBox(height: 14),
              ...vm.news.map((article) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _NewsCard(article: article),
                  )),

              const SizedBox(height: 8),
            ]),
          ),
        ),
      ],
    );
  }
}

// ============================================================
//  Section 1: Header
// ============================================================

class _HomeHeader extends StatelessWidget {
  final HomeViewModel vm;
  const _HomeHeader({required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.fromLTRB(20, 16, 16, 16),
      child: Row(
        children: [
          // Greeting + name
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  vm.greeting,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  vm.userName,
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    height: 1.2,
                  ),
                ),
              ],
            ),
          ),

          // Notification bell
          _NotifBell(),
        ],
      ),
    );
  }
}

class _NotifBell extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '\uD83D\uDD14 Th\xF4ng b\xE1o s\u1EAFp ra m\u1EAFt!',
              style: GoogleFonts.inter(fontSize: 13),
            ),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10)),
            duration: const Duration(seconds: 2),
          ),
        );
      },
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: AppColors.canvasColor,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.borderLight),
        ),
        child: const Icon(
          Icons.notifications_outlined,
          size: 20,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}

// ============================================================
//  Section 2: Hero Card — L\u1ECBch h\u1EB9n ti\u1EBFp theo
// ============================================================

class _NextAppointmentHeroCard extends StatelessWidget {
  final HomeViewModel vm;
  const _NextAppointmentHeroCard({required this.vm});

  @override
  Widget build(BuildContext context) {
    final appt = vm.nextAppointment;

    if (appt == null) {
      return _NoAppointmentCard();
    }

    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(70),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge row
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.heroLabelBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'L\u1ECBch h\u1EB9n ti\u1EBFp theo',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(50),
                  borderRadius: BorderRadius.circular(20),
                  border:
                      Border.all(color: AppColors.success.withAlpha(100)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline_rounded,
                        size: 12, color: AppColors.white),
                    const SizedBox(width: 4),
                    Text(
                      appt.status,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Doctor info
          Text(
            appt.doctorName,
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            appt.specialty,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.onDarkSubtle,
            ),
          ),

          const SizedBox(height: 16),

          // Date / Location row
          _HeroInfoRow(
            icon: Icons.calendar_today_outlined,
            label:
                '${DateFormat('dd/MM/yyyy').format(appt.dateTime)}  —  ${DateFormat('HH:mm').format(appt.dateTime)}',
          ),
          const SizedBox(height: 8),
          _HeroInfoRow(
            icon: Icons.location_on_outlined,
            label: appt.location,
          ),

          const SizedBox(height: 20),

          // Actions
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => context.go('/schedule'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        'Xem chi ti\u1EBFt',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => context.push('/schedule/book'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.heroOutlinedBtnBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: AppColors.heroOutlinedBtnBorder),
                    ),
                    child: Center(
                      child: Text(
                        '\u0110\u1EB7t l\u1ECBch m\u1EDBi',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _NoAppointmentCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(60),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Icon(Icons.event_available_outlined,
              size: 48, color: AppColors.onDarkSubtle),
          const SizedBox(height: 12),
          Text(
            'B\u1EA1n ch\u01B0a c\xF3 l\u1ECBch h\u1EB9n n\xE0o',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '\u0110\u1EB7t l\u1ECBch ngay \u0111\u1EC3 \u0111\u01B0\u1EE3c t\u01B0 v\u1EA5n v\u00E0 ch\u0103m s\xF3c s\u1EE9c kh\u1ECFe',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.onDarkSubtle,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: () => context.push('/schedule/book'),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 32, vertical: 13),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '\u0110\u1EB7t l\u1ECBch ngay',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  const _HeroInfoRow({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.onDarkSubtle),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.onDarkSubtle,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

// ============================================================
//  Section 3: Vital Signs Chart
// ============================================================

/// Which metric is currently highlighted in the chart tab bar.
class _VitalSignsChartCard extends StatefulWidget {
  final HomeViewModel vm;
  const _VitalSignsChartCard({required this.vm});

  @override
  State<_VitalSignsChartCard> createState() => _VitalSignsChartCardState();
}

class _VitalSignsChartCardState extends State<_VitalSignsChartCard> {
  int _selectedMetric = 0; // 0=HR, 1=BP, 2=Resp, 3=Temp

  static const _metrics = [
    _MetricDef(
      label: 'Nh\u1ECBp tim',
      unit: 'bpm',
      icon: Icons.favorite_rounded,
      color: AppColors.error,
    ),
    _MetricDef(
      label: 'Huy\u1EBFt \u00E1p',
      unit: 'mmHg',
      icon: Icons.water_drop_outlined,
      color: AppColors.primary,
    ),
    _MetricDef(
      label: 'Nh\u1ECBp th\u1EDF',
      unit: 'l/ph',
      icon: Icons.air_outlined,
      color: AppColors.teal,
    ),
    _MetricDef(
      label: 'Nhi\u1EC7t \u0111\u1ED9',
      unit: '\u00B0C',
      icon: Icons.thermostat_outlined,
      color: AppColors.orange,
    ),
  ];

  List<double> _values(List<VitalChartPoint> pts) {
    switch (_selectedMetric) {
      case 0:
        return pts.map((p) => p.heartRate).toList();
      case 1:
        return pts.map((p) => p.systolic).toList();
      case 2:
        return pts.map((p) => p.respRate).toList();
      default:
        return pts.map((p) => p.temperature).toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    final pts = widget.vm.vitalHistory;
    final metric = _metrics[_selectedMetric];

    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withAlpha(12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Metric tab selector
          _MetricTabBar(
            metrics: _metrics,
            selected: _selectedMetric,
            onSelect: (i) => setState(() => _selectedMetric = i),
          ),

          // Chart area
          if (pts.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Text(
                  'Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u',
                  style: GoogleFonts.inter(color: AppColors.textSecondary),
                ),
              ),
            )
          else
            _LineChartArea(
              points: pts,
              values: _values(pts),
              color: metric.color,
              unit: metric.unit,
            ),

          // Latest value summary row
          if (pts.isNotEmpty) _LatestValueRow(pts: pts, metric: _selectedMetric),
        ],
      ),
    );
  }
}

class _MetricTabBar extends StatelessWidget {
  final List<_MetricDef> metrics;
  final int selected;
  final ValueChanged<int> onSelect;

  const _MetricTabBar({
    required this.metrics,
    required this.selected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: List.generate(metrics.length, (i) {
            final m = metrics[i];
            final isSelected = i == selected;
            return GestureDetector(
              onTap: () => onSelect(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: isSelected
                      ? m.color.withAlpha(20)
                      : AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? m.color.withAlpha(100)
                        : AppColors.transparent,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      m.icon,
                      size: 14,
                      color: isSelected ? m.color : AppColors.textHint,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      m.label,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w400,
                        color: isSelected ? m.color : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _LineChartArea extends StatelessWidget {
  final List<VitalChartPoint> points;
  final List<double> values;
  final Color color;
  final String unit;

  const _LineChartArea({
    required this.points,
    required this.values,
    required this.color,
    required this.unit,
  });

  @override
  Widget build(BuildContext context) {
    final minVal = values.reduce((a, b) => a < b ? a : b);
    final maxVal = values.reduce((a, b) => a > b ? a : b);
    final padding = (maxVal - minVal) < 5 ? 5.0 : (maxVal - minVal) * 0.2;

    final spots = List.generate(
      values.length,
      (i) => FlSpot(i.toDouble(), values[i]),
    );

    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 20, 16, 8),
      child: SizedBox(
        height: 160,
        child: LineChart(
          LineChartData(
            minY: (minVal - padding).floorToDouble(),
            maxY: (maxVal + padding).ceilToDouble(),
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              horizontalInterval: padding < 1 ? 0.5 : padding,
              getDrawingHorizontalLine: (_) => FlLine(
                color: AppColors.borderLight,
                strokeWidth: 1,
              ),
            ),
            borderData: FlBorderData(show: false),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 40,
                  interval: padding < 1 ? 0.5 : padding,
                  getTitlesWidget: (v, _) => Text(
                    v.toStringAsFixed(unit == '\u00B0C' ? 1 : 0),
                    style: GoogleFonts.inter(
                        fontSize: 10, color: AppColors.textHint),
                  ),
                ),
              ),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 24,
                  getTitlesWidget: (v, _) {
                    final idx = v.toInt();
                    if (idx < 0 || idx >= points.length) {
                      return const SizedBox.shrink();
                    }
                    return Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        DateFormat('MM/yy').format(points[idx].date),
                        style: GoogleFonts.inter(
                            fontSize: 9, color: AppColors.textHint),
                      ),
                    );
                  },
                ),
              ),
              topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
            ),
            lineTouchData: LineTouchData(
              touchTooltipData: LineTouchTooltipData(
                getTooltipColor: (_) => color.withAlpha(230),
                getTooltipItems: (spots) => spots
                    .map((s) => LineTooltipItem(
                          ' ',
                          GoogleFonts.inter(
                              color: AppColors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600),
                        ))
                    .toList(),
              ),
            ),
            lineBarsData: [
              LineChartBarData(
                spots: spots,
                isCurved: true,
                curveSmoothness: 0.35,
                color: color,
                barWidth: 2.5,
                dotData: FlDotData(
                  show: true,
                  getDotPainter: (spot, pct, barIndex, spotIndex) => FlDotCirclePainter(
                    radius: 4,
                    color: AppColors.white,
                    strokeWidth: 2,
                    strokeColor: color,
                  ),
                ),
                belowBarData: BarAreaData(
                  show: true,
                  gradient: LinearGradient(
                    colors: [color.withAlpha(50), color.withAlpha(0)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LatestValueRow extends StatelessWidget {
  final List<VitalChartPoint> pts;
  final int metric;
  const _LatestValueRow({required this.pts, required this.metric});

  @override
  Widget build(BuildContext context) {
    final last = pts.last;
    final String valueStr;
    final String label;
    final String unit;

    switch (metric) {
      case 0:
        valueStr = last.heartRate.toStringAsFixed(0);
        label = 'Nh\u1ECBp tim';
        unit = 'bpm';
        break;
      case 1:
        valueStr = last.systolic.toStringAsFixed(0);
        label = 'Huy\u1EBFt \u00E1p t\u00E2m thu';
        unit = 'mmHg';
        break;
      case 2:
        valueStr = last.respRate.toStringAsFixed(0);
        label = 'Nh\u1ECBp th\u1EDF';
        unit = 'l/ph\u00Fat';
        break;
      default:
        valueStr = last.temperature.toStringAsFixed(1);
        label = 'Nhi\u1EC7t \u0111\u1ED9 c\u01A1 th\u1EC3';
        unit = '\u00B0C';
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 4, 16, 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.canvasColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "G\u1EA7n nh\u1EA5t \u2014 ${DateFormat("dd/MM/yyyy").format(last.date)}",
                style: GoogleFonts.inter(
                    fontSize: 11, color: AppColors.textHint),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: GoogleFonts.inter(
                    fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
          const Spacer(),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: valueStr,
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextSpan(
                  text: ' $unit',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
//  Section 4: Health News
// ============================================================

class _NewsCard extends StatelessWidget {
  final HealthNewsArticle article;
  const _NewsCard({required this.article});

  Color get _categoryColor {
    switch (article.category) {
      case 'Tim m\u1EA1ch':
        return AppColors.error;
      case 'Dinh d\u01B0\u1EE1ng':
        return AppColors.success;
      case 'Ph\xF2ng b\u1EC7nh':
        return AppColors.teal;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withAlpha(8),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: AppColors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  '\uD83D\uDCF0 T\xEDnh n\u0103ng \u0111\u1ECDc tin t\u1EE9c s\u1EAFp ra m\u1EAFt!',
                  style: GoogleFonts.inter(fontSize: 13),
                ),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
                duration: const Duration(seconds: 2),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category color strip
                Container(
                  width: 4,
                  height: 70,
                  decoration: BoxDecoration(
                    color: _categoryColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 14),

                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category badge + date
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _categoryColor.withAlpha(20),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              article.category,
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: _categoryColor,
                              ),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            DateFormat('dd/MM').format(article.publishedAt),
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textHint,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Title
                      Text(
                        article.title,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),

                      // Read time
                      Row(
                        children: [
                          Icon(Icons.access_time_outlined,
                              size: 12, color: AppColors.textHint),
                          const SizedBox(width: 4),
                          Text(
                            article.readTime,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textHint,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Chevron
                Padding(
                  padding: const EdgeInsets.only(top: 20),
                  child: Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textHint,
                    size: 18,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ============================================================
//  Shared helpers
// ============================================================

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: AppColors.textSecondary,
        letterSpacing: 0.8,
      ),
    );
  }
}

// ============================================================
//  Data definitions
// ============================================================

class _MetricDef {
  final String label;
  final String unit;
  final IconData icon;
  final Color color;

  const _MetricDef({
    required this.label,
    required this.unit,
    required this.icon,
    required this.color,
  });
}
