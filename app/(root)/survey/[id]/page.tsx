'use client';

import { Button, Container, Space, Stack, Title } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'next/navigation';
import Question from '@/app/(root)/survey/[id]/components/question';
import { QuestionProps } from '@/api/QuestionApi';
import { SERVER_URL } from '@/api/BackendApi';
import AnswerApi, { SaveRequest } from '@/api/AnswerApi';

export default function SurveyPage({ params }: { params: { id: number } }) {
    const [currentPage, setCurrentPage] = useState<number | null>(null);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [questions, setQuestions] = useState<PageResponse | undefined>(undefined);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());
    const searchParams = useSearchParams();
    const questionsProps = useRef(new Map<string, QuestionProps>());

    const answerId = useRef(searchParams.get('answer'));

    function save() {
        const answerObject: any = {};
        answers.forEach((value, key) => {
            answerObject[key] = value;
        });

        const surveyID = Number(params.id);
        const raw: SaveRequest = {
            survey: surveyID,
            content: answerObject,
        };

        if (answerId.current != null) {
            raw.id = Number(answerId.current);
        }

        let flag = false;
        for (const q of questions?.content || []) {
            if ((!answers.has(q) || answers.get(q) === undefined)
                && checkAccess(questionsProps.current.get(q)?.condition || null)
                && questionsProps.current.get(q)?.required) {
                flag = true;
            }
        }
        if (flag) {
            notifications.show({
                title: '请填写所有题目',
                message: '请填写所有题目后再提交',
                color: 'red',
            });
            return;
        }

        AnswerApi.submitAnswer(raw)
            .then((result) => {
                answerId.current = result.toString();
            });

        if (nextPage !== null) {
            setCurrentPage(nextPage);
        }
    }

    const getAnswerSetter = (id: string) => (value: string) => {
        const newAnswers = new Map(answers);
        newAnswers.set(id, value);
        setAnswers(newAnswers);
    };

    const getAnswerGetter = (id: string) => answers.get(id) || undefined;

    const getPropsSetter = (id: string) => (value: QuestionProps) => {
        questionsProps.current.set(id, value);
    };

    function checkAccess(ruleStr: string | null): boolean {
        if (ruleStr == null) {
            return true;
        }

        const rules: Rule[] = JSON.parse(ruleStr);

        for (const rule of rules) {
            const results = rule.conditions.map((condition) => {
                if (condition.value instanceof Array) {
                    const value: string[] = JSON.parse(getAnswerGetter(condition.id) || '[]');
                    for (const v of condition.value) {
                        if (value.includes(v)) {
                            return true;
                        }
                    }
                    return false;
                }

                return getAnswerGetter(condition.id) === JSON.stringify(condition.value);
            });

            if ((rule.type === 'and' && results.every(Boolean)) ||
                (rule.type === 'or' && results.some(Boolean)) ||
                (rule.type === 'not' && !results.every(Boolean))) {
                return true;
            }
        }

        return false;
    }

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append('token', '111');

        const requestOptions: RequestInit = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',
        };

        fetch(`${SERVER_URL}/api/survey/${params.id}`, requestOptions)
            .then(response => response.text())
            .then(result => {
                const response: SurveyResponse = JSON.parse(result);
                setCurrentPage(response.page);
            })
            .catch(error => {
                notifications.show({
                    title: '获取试题失败，请将以下信息反馈给管理员',
                    message: error.toString(),
                    color: 'red',
                });
            });
    }, [params.id]);

    useEffect(() => {
        if (currentPage !== null) {
            const myHeaders = new Headers();
            myHeaders.append('token', '111');

            const requestOptions: RequestInit = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
            };

            fetch(`${SERVER_URL}/api/question?page=${currentPage}`, requestOptions)
                .then(response => response.text())
                .then(result => {
                    const response: PageResponse = JSON.parse(result);
                    setQuestions(response);
                    setNextPage(response.next);
                });
        }
    }, [currentPage]);

    return (
        <Stack>
            <Container maw={1600} w="90%">
                <Space h={100} />
                <Title>{questions?.title}</Title>
                {questions?.content.map((question, index) => (
                    <Question
                      id={question}
                      key={index}
                      value={getAnswerGetter(question)}
                      setValue={getAnswerSetter(question)}
                      setProps={getPropsSetter(question)}
                      checkAccess={checkAccess}
                    />
                ))}
                <Space h={50} />
                <Button onClick={save}>{nextPage == null ? '提交' : '下一页'}</Button>
                <Space h={180} />
            </Container>
        </Stack>
    );
}

interface SurveyResponse {
    id: number;
    title: string;
    budge: string;
    description: string;
    image: string;
    page: number;
    start_date: string;
    end_date: string;
}

export interface PageResponse {
    id: string;
    title: string;
    budge: string;
    content: string[];
    next: number | null;
}

export type ConditionType = 'and' | 'or' | 'not';

export interface Condition {
    id: string;
    value: any;
}

export interface Rule {
    type: ConditionType;
    conditions: Condition[];
}
