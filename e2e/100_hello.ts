import axios from "axios"

const url = process.env.URL

export const helloTest = () => {
  test("should reply success", async () => {
    const res = await axios.get(`${url}/hello`)
    expect(res.status).toEqual(200)
    expect(res.data.message).toMatch(/Your function executed successfully!/)
  })
}
