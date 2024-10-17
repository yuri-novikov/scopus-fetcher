import {
  Box,
  Button,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Select,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { useRef, useState } from 'react'

export interface IAuthor {
  $: string
}

export interface IAuthors {
  author: IAuthor[]
}

export interface ILinkEntry {
  '@_fa': string
  '@ref': string
  '@href': string
}

export interface IEntry {
  '@_fa': string
  'load-date': string
  link: ILinkEntry[]
  'dc:identifier': string
  'prism:url': string
  'dc:title': string
  'dc:creator': string
  'prism:publicationName': string
  'prism:volume'?: string
  'prism:coverDate': string
  'prism:startingPage'?: string
  'prism:doi': string
  openaccess: boolean
  pii: string
  authors: IAuthors
  'prism:endingPage'?: string
}

function App() {
  const [results, setResults] = useState<IEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const total = useRef(null)

  const formik = useFormik({
    initialValues: {
      yearFrom: 2022,
      yearTo: 2024,
      query: '',
      page: 1,
      count: 20,
    },
    onSubmit: async (values) => {
      setIsLoading(true)
      const url = `https://api.elsevier.com/content/search/sciencedirect?query=${values.query}&date=${
        values.yearFrom
      }-${values.yearTo}&start=${values.page}&count=${values.count}&apiKey=${
        import.meta.env.VITE_API_KEY
      }&httpAccept=application%2Fjson`
      const response = await fetch(url)
      const result = await response.json()

      setResults(result['search-results']['entry'])
      total.current = result['search-results']['opensearch:totalResults']
      setIsLoading(false)
    },
  })

  return (
    <Box p={8}>
      <form onSubmit={formik.handleSubmit}>
        <Heading pb={8}>Scopus Fetcher</Heading>

        <VStack gap={4} border='1px solid gray' borderRadius={8} p={4}>
          <Box w='full' position='sticky'>
            <FormLabel htmlFor='query'>Query</FormLabel>
            <Input
              required
              placeholder='Enter query'
              value={formik.values.query}
              id='query'
              name='query'
              type='text'
              onChange={formik.handleChange}
            />
          </Box>
          <HStack w='full'>
            <Box flex={1}>
              <FormLabel htmlFor='yearFrom'>From</FormLabel>
              <Input value={formik.values.yearFrom} id='yearFrom' type='number' onChange={formik.handleChange} />
            </Box>
            <Box flex={1}>
              <FormLabel htmlFor='yearTo'>To</FormLabel>
              <Input
                value={formik.values.yearTo}
                id='yearTo'
                type='number'
                onChange={formik.handleChange}
                max={new Date().getFullYear()}
              />
            </Box>
            {/* <Box flex={1}>
              <FormLabel htmlFor='page'>Page</FormLabel>
              <Input value={formik.values.page} id='page' type='number' onChange={formik.handleChange} />
            </Box> */}
            <Box flex={1}>
              <FormLabel htmlFor='count'>Count per page</FormLabel>
              <Select
                value={formik.values.count}
                id='count'
                name='count'
                onChange={(e) => {
                  formik.handleChange(e)
                  formik.setValues({ ...formik.values, page: 1 })
                  formik.handleSubmit()
                }}
              >
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </Select>
            </Box>
            <Box flexBasis={'40%'} justifyContent={'flex-end'}>
              <Button isLoading={isLoading} w='full' mt='8' type='submit'>
                Search
              </Button>
            </Box>
          </HStack>
        </VStack>

        {total.current && (
          <HStack mt={4} gap={4}>
            <Button
              disabled={isLoading || formik.values.page === 1}
              onClick={() => {
                formik.setFieldValue('page', formik.values.page - 1)
                formik.handleSubmit()
              }}
            >
              Prev
            </Button>
            <Text>
              Page: {formik.values.page} of {Math.ceil(total.current / formik.values.count)} |{' '}
              {formik.values.count * formik.values.page - formik.values.count} -{' '}
              {formik.values.count * formik.values.page} of {total.current}
            </Text>
            <Button
              disabled={isLoading}
              onClick={() => {
                formik.setFieldValue('page', formik.values.page + 1)
                formik.handleSubmit()
              }}
            >
              Next
            </Button>
          </HStack>
        )}
      </form>
      <TableContainer mt={4}>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>Доступ</Th>
              <Th>Название статьи</Th>
              <Th>Авторы</Th>
              <Th>Название публикации</Th>
              <Th>Том</Th>
              <Th>Дата выпуска</Th>
              <Th>DOI</Th>
              <Th>PII</Th>
            </Tr>
          </Thead>
          <Tbody style={{ textWrap: 'wrap' }}>
            {results.length > 1 ? (
              results.map((result) => (
                <Tr key={result['dc:identifier']} bgColor={result.openaccess ? 'green.50' : 'red.50'}>
                  <Td>
                    <Tag colorScheme={result.openaccess ? 'green' : 'red'}>{result.openaccess ? 'Open' : 'Closed'}</Tag>
                  </Td>
                  <Td>
                    <Link
                      color={'blue.500'}
                      fontSize={'lg'}
                      lineHeight={1.3}
                      isExternal
                      href={result.link.length ? result.link[1]['@href'] : ''}
                    >
                      {result['dc:title']}
                    </Link>
                  </Td>
                  <Td>
                    <>
                      {result.authors && result.authors.author && Array.isArray(result.authors.author)
                        ? result.authors.author.map((author) =>
                            typeof author === 'string' ? author : <Text key={author.$}>{author.$}</Text>
                          )
                        : result.authors?.author || 'None'}
                    </>
                  </Td>
                  <Td>
                    <Text maxW={200}>{result['prism:publicationName']}</Text>
                  </Td>
                  <Td>{result['prism:volume']}</Td>
                  <Td>{result['prism:coverDate']}</Td>
                  <Td>{result['prism:doi']}</Td>
                  <Td>{result.pii}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td>Ничего не нашлось</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default App
