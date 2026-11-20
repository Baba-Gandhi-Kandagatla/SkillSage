import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getOnlyEvalMetrics } from "@/Communicators/studentCommunications";
import { Loader2 } from "lucide-react"; 
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
ChartJS.register(RadialLinearScale, ArcElement, ChartTooltip, ChartLegend, ChartDataLabels);

export function StudentPerformance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [evalData, setEvalData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getOnlyEvalMetrics();
        setEvalData(data);
      } catch (error) {
        console.error("Error fetching evaluation metrics:", error);
      }
    })();
  }, []);

  // Derive interview performance data
  const interviewPerformance =
    evalData && evalData.interviewInstancesMarks
      ? evalData.interviewInstancesMarks.map((item: any) => ({
          name: item.Interview.name,
          marks: item.marks,
        }))
      : [];

  // Derive skills data from evaluationMetrics and normalize value
  const skillsData =
    evalData && evalData.evaluationMetrics && evalData.evaluationMetrics.length
      ? evalData.evaluationMetrics[0].skills.map((skill: any) => ({
          ...skill,
          value: parseInt(skill.value)   // normalized
        }))
      : [];

  // Derive attributes data (problem solving, code quality, debugging) and normalize values
  const attributesData =
    evalData && evalData.evaluationMetrics && evalData.evaluationMetrics.length
      ? [
          {
            name: "Problem Solving",
            value: parseFloat(evalData.evaluationMetrics[0].problem_solving) ,
          },
          {
            name: "Code Quality",
            value: parseFloat(evalData.evaluationMetrics[0].code_quality) ,
          },
          {
            name: "Debugging",
            value: parseFloat(evalData.evaluationMetrics[0].debugging) ,
          },
        ]
      : [];

  // Updated vibrant color palette with 11 distinct colors
  const COLORS = [
    '#C94C4C', // Warm Brick Red  
    '#D3756B', // Muted Coral  
    '#DC8850', // Deep Sunset Orange  
    '#E3A857', // Rich Goldenrod  
    '#A9845C', // Earthy Sandstone  
    '#7D9D72', // Soft Olive Green  
    '#5F8575', // Muted Teal  
    '#4F759B', // Dusty Blue  
    '#4464AD', // Royal Blue  
    '#7158A1', // Deep Lavender  
    '#9A4785', // Muted Plum  
  ];
  
  
  

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        {/* if u want skill name at the  center of the pie chart, add here   */}
        <Pie
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          dataKey={""}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >
          {`Value ${value}`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(${(percent).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  // Updated polar area chart data
  const polarAreaData = {
    labels: skillsData.map((skill: any) => skill.skill),
    datasets: [
      {
        data: skillsData.map((skill: any) => skill.value),
        backgroundColor: COLORS.map(color => `${color}dd`), // Less transparency
        borderColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  // Updated polar area options with skill name labels
  const polarAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: '#000',
        font: {
          weight: 'bold' as const,
          size: 13,
        },
        formatter: (value: number, context: any) => {
          return context.chart.data.labels[context.dataIndex];
        },
        align: 'end' as const,
        anchor: 'end' as const,
        offset: 10,
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 13,
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.raw}%`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: false,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const CardWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 bg-white min-h-screen pt-20">
        <h1 className="text-3xl font-bold text-center mb-5 text-gray-800">
          Student Progress Dashboard
        </h1>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Interview Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills & Attributes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <CardWrapper>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Interview Marks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {evalData ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={interviewPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" interval={0} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="marks"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-96">
                        <Loader2 className="animate-spin" size={48} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardWrapper>
            </div>
          </TabsContent>
          <TabsContent value="skills">
            <div className="flex flex-col gap-4">
              <CardWrapper>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Skills Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '700px', position: 'relative', padding: '20px' }}>
                      {skillsData.length > 0 ? (
                        <PolarArea 
                          data={polarAreaData} 
                          options={polarAreaOptions}
                        />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="animate-spin" size={48} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardWrapper>
              
              <CardWrapper>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Performance Attributes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '400px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={attributesData}
                          margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#4ECDC4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </CardWrapper>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
