package controller;

import com.google.gson.Gson;
import entity.Chat_Status;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Session;

//@MultipartConfig
@WebServlet(name = "Test", urlPatterns = {"/Test"})
public class Test extends HttpServlet {

//    @Override
//    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//        
//        String name = request.getParameter("name");
//        System.out.println(name);     
//        response.getWriter().write("ok");
//       
//    }
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        String name = request.getParameter("name");
        System.out.println(name);
        response.getWriter().write("ok");
    }
    
}
