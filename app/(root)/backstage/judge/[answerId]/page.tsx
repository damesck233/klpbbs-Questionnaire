'use client';

import React, { useEffect, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Button, Container, Space, Stack, Title, Text, Center } from '@mantine/core';
import AnswerApi, { AnswerInfo } from '@/api/AnswerApi';
import QuestionApi, { Page, QuestionProps } from '@/api/QuestionApi';
import SurveyApi from '@/api/SurveyApi';
import { Rule } from '@/app/(root)/survey/[id]/page';
import Question from '@/app/(root)/backstage/judge/[answerId]/components/questions';

export default function JudgeSinglePage({ params }: { params: { answerId: number } }) {
    const { answerId } = params;
    const [, setAnswer] = useState<AnswerInfo | null>(null);
    const [userAnswer, setUserAnswer] = useState<Map<string, string>>(new Map());
    const [page, setPage] = useState<Page | null>(null);
    // const [correctAnswer, setCorrectAnswer] = useState({});
    const [currentPage, setCurrentPage] = useState<string | null>(null);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const questionsProps = useRef(new Map<string, QuestionProps>());

    useEffect(() => {
        AnswerApi.getAnswer(answerId)
            .then((res) => {
                setAnswer(res);
                setUserAnswer(new Map(Object.entries(res.answers)));
                SurveyApi.getSurvey(res.survey)
                    .then((res2) => {
                        setCurrentPage(res2.page);
                    });
            })
            .catch((error) => {
                notifications.show({
                    title: '失败',
                    message: error.toString(),
                    color: 'red',
                });
            });
    }, []);

    useEffect(() => {
        if (currentPage == null) {
            return;
        }
        QuestionApi.fetchPage(currentPage)
            .then((res) => {
                setNextPage(res.next);
                setPage(res);
            });
    }, [currentPage]);

    const getAnswerGetter = (id: string) => userAnswer.get(id) || undefined;

    const getPropsSetter = (id: string) => (value: QuestionProps) => {
        questionsProps.current.set(id, value);
    };

    function checkAccess(ruleStr: string | null): boolean {
        if (ruleStr == null) {
            return true;
        }

        const rules: Rule[] = JSON.parse(ruleStr);

        for (const rule of rules) {
            const results = rule.conditions.map((condition: Condition) => {
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

    return (
        <Stack>
            <Center>
                <Title>
                    阅卷系统
                </Title>
            </Center>
            <Center>
                <Text>
                    当前问卷: {answerId}
                </Text>
            </Center>
            <Container maw={1600} w="90%">
                <Space h={40} />
                <Title>{page?.title}</Title>
                {page?.content.map((question, index) => (
                    <Question
                      id={question}
                      key={index}
                      value={getAnswerGetter(question)}
                      setValue={() => {}}
                      setProps={getPropsSetter(question)}
                      checkAccess={checkAccess}
                      disabled />
                ))}
                <Space h={50} />
                <Button>{nextPage == null ? '提交' : '下一页'}</Button>
                <Space h={180} />
            </Container>
        </Stack>

    );
}

interface Condition {
    id: string;
    value: any;
}
